import os
import tensorflow as tf

def load_datasets(data_dir, img_size=(224, 224), batch_size=32, validation_split=0.3, seed=42):
    """
    Loads images from real/ and fake/ directories inside data_dir.
    Splits data into train (70%), val (15%), and test (15%).
    Applies normalization and data augmentation on training set.
    """
    if not os.path.exists(data_dir):
        raise FileNotFoundError(f"Dataset directory '{data_dir}' does not exist.")

    # 70% train, 30% combined (val + test)
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

    # Split validation dataset into 50% val and 50% test (15% overall each)
    val_batches = tf.data.experimental.cardinality(raw_val_test_ds)
    val_size = val_batches // 2
    
    val_ds = raw_val_test_ds.take(val_size)
    test_ds = raw_val_test_ds.skip(val_size)

    # Data augmentation pipeline for training data only
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.1),
        tf.keras.layers.RandomBrightness(0.2)
    ], name="data_augmentation")

    # Rescaling layer to normalize pixel values to [0, 1]
    rescale_layer = tf.keras.layers.Rescaling(1.0 / 255)

    def prepare_train(x, y):
        x = data_augmentation(x)
        x = rescale_layer(x)
        return x, y

    def prepare_eval(x, y):
        x = rescale_layer(x)
        return x, y

    train_ds = raw_train_ds.map(prepare_train, num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.map(prepare_eval, num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)
    test_ds = test_ds.map(prepare_eval, num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)

    return train_ds, val_ds, test_ds, label_map
