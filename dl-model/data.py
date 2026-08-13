import os
import tensorflow as tf

def find_subfolder(parent_dir, names):
    """Finds a subfolder in parent_dir matching any of the names (case-insensitive)."""
    if not os.path.exists(parent_dir):
        return None
    for entry in os.listdir(parent_dir):
        full_path = os.path.join(parent_dir, entry)
        if os.path.isdir(full_path) and entry.lower() in [n.lower() for n in names]:
            return full_path
    return None

def load_datasets(data_dir, img_size=(380, 380), batch_size=32, validation_split=0.3, seed=42, 
                  max_train_samples=None, max_val_samples=None, max_test_samples=None):
    """
    Loads images from dataset directory.
    NOTE: EfficientNet includes internal Rescaling/Normalization layers,
    so raw pixel values [0, 255] are passed directly to the model.
    """
    if not os.path.exists(data_dir):
        raise FileNotFoundError(f"Dataset directory '{data_dir}' does not exist.")

    dataset_sub = find_subfolder(data_dir, ["Dataset"])
    target_root = dataset_sub if dataset_sub else data_dir

    train_folder = find_subfolder(target_root, ["Train", "train", "training"])
    val_folder = find_subfolder(target_root, ["Validation", "validation", "val", "valid"])
    test_folder = find_subfolder(target_root, ["Test", "test", "testing"])

    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.1),
        tf.keras.layers.RandomTranslation(0.05, 0.05),
        tf.keras.layers.RandomBrightness(0.15),
        tf.keras.layers.RandomZoom((-0.1, 0.1)),
        tf.keras.layers.RandomContrast(0.15),
    ], name="data_augmentation")

    def prepare_train(x, y):
        x = data_augmentation(x)
        return x, y

    def prepare_eval(x, y):
        return x, y

    if train_folder and (val_folder or test_folder):
        print(f"[INFO] Detected pre-split dataset in '{target_root}':")
        print(f"       Train: {train_folder}")
        print(f"       Validation: {val_folder}")
        print(f"       Test: {test_folder}")

        raw_train_ds = tf.keras.utils.image_dataset_from_directory(
            train_folder,
            seed=seed,
            image_size=img_size,
            batch_size=batch_size,
            label_mode="binary"
        )
        class_names = raw_train_ds.class_names
        label_map = {i: name.upper() for i, name in enumerate(class_names)}

        if val_folder:
            raw_val_ds = tf.keras.utils.image_dataset_from_directory(
                val_folder,
                seed=seed,
                image_size=img_size,
                batch_size=batch_size,
                label_mode="binary"
            )
        else:
            raw_val_ds = raw_train_ds.take(max(1, len(raw_train_ds) // 5))

        if test_folder:
            raw_test_ds = tf.keras.utils.image_dataset_from_directory(
                test_folder,
                seed=seed,
                image_size=img_size,
                batch_size=batch_size,
                label_mode="binary"
            )
        else:
            raw_test_ds = raw_val_ds

        if max_train_samples:
            max_batches = max(1, max_train_samples // batch_size)
            raw_train_ds = raw_train_ds.take(max_batches)
        if max_val_samples:
            max_batches = max(1, max_val_samples // batch_size)
            raw_val_ds = raw_val_ds.take(max_batches)
        if max_test_samples:
            max_batches = max(1, max_test_samples // batch_size)
            raw_test_ds = raw_test_ds.take(max_batches)

        train_ds = raw_train_ds.map(prepare_train, num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)
        val_ds = raw_val_ds.map(prepare_eval, num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)
        test_ds = raw_test_ds.map(prepare_eval, num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)

        return train_ds, val_ds, test_ds, label_map

    else:
        print(f"[INFO] Using unified dataset split (70/15/15) from '{data_dir}'...")
        raw_train_ds = tf.keras.utils.image_dataset_from_directory(
            data_dir,
            validation_split=validation_split,
            subset="training",
            seed=seed,
            image_size=img_size,
            batch_size=batch_size,
            label_mode="binary"
        )

        raw_val_test_ds = tf.keras.utils.image_dataset_from_directory(
            data_dir,
            validation_split=validation_split,
            subset="validation",
            seed=seed,
            image_size=img_size,
            batch_size=batch_size,
            label_mode="binary"
        )

        class_names = raw_train_ds.class_names
        label_map = {i: name.upper() for i, name in enumerate(class_names)}

        val_batches = tf.data.experimental.cardinality(raw_val_test_ds)
        val_size = val_batches // 2

        val_ds_raw = raw_val_test_ds.take(val_size)
        test_ds_raw = raw_val_test_ds.skip(val_size)

        if max_train_samples:
            max_batches = max(1, max_train_samples // batch_size)
            raw_train_ds = raw_train_ds.take(max_batches)

        train_ds = raw_train_ds.map(prepare_train, num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)
        val_ds = val_ds_raw.map(prepare_eval, num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)
        test_ds = test_ds_raw.map(prepare_eval, num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)

        return train_ds, val_ds, test_ds, label_map
