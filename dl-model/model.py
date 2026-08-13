import tensorflow as tf
from tensorflow.keras import layers, models, metrics

def build_model(architecture="EfficientNetB4", input_shape=None, label_smoothing=0.05):
    """
    Builds an EfficientNet (B4 or B0)-based Deep Learning classification model.
    Initially freezes base model for Phase 1 transfer learning.
    
    Default: EfficientNetB4 with (380, 380, 3) resolution.
    """
    if architecture == "EfficientNetB4":
        if input_shape is None:
            input_shape = (380, 380, 3)
        base_model_cls = tf.keras.applications.EfficientNetB4
    else:
        if input_shape is None:
            input_shape = (224, 224, 3)
        base_model_cls = tf.keras.applications.EfficientNetB0

    base_model = base_model_cls(
        weights="imagenet",
        include_top=False,
        input_shape=input_shape
    )

    base_model.trainable = False  # Freeze base model for Phase 1

    inputs = layers.Input(shape=input_shape)
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    
    # Enhanced Dense Classification Head
    x = layers.Dense(512, activation="relu", kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)
    
    x = layers.Dense(256, activation="relu", kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    
    outputs = layers.Dense(1, activation="sigmoid")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name=f"Authentix_{architecture}")

    loss_fn = tf.keras.losses.BinaryCrossentropy(label_smoothing=label_smoothing)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss=loss_fn,
        metrics=[
            "accuracy",
            metrics.Precision(name="precision"),
            metrics.Recall(name="recall"),
            metrics.AUC(name="auc")
        ]
    )
    return model, base_model, input_shape

def unfreeze_for_finetuning(model, base_model, num_layers_to_unfreeze=50, learning_rate=1e-5, label_smoothing=0.05):
    """
    Unfreezes top N layers of base_model for Phase 2 fine-tuning.
    Recompiles model with a smaller learning rate.
    """
    base_model.trainable = True
    
    # Freeze all layers except the last num_layers_to_unfreeze
    for layer in base_model.layers[:-num_layers_to_unfreeze]:
        layer.trainable = False

    loss_fn = tf.keras.losses.BinaryCrossentropy(label_smoothing=label_smoothing)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss=loss_fn,
        metrics=[
            "accuracy",
            metrics.Precision(name="precision"),
            metrics.Recall(name="recall"),
            metrics.AUC(name="auc")
        ]
    )
    return model

