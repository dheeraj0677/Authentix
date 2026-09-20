import tensorflow as tf
from tensorflow.keras import layers, models, metrics

def build_model(architecture="EfficientNetB4", input_shape=None, label_smoothing=0.05, learning_rate=1e-3):
    """
    Builds an EfficientNet (B4 or B0)-based Deep Learning classification model.
    Initially freezes base model for Phase 1 transfer learning.
    Enhanced with a 3-layer Swish dense head and calibrated dropout for higher accuracy.
    
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
    
    # Enhanced Dense Classification Head (3-stage distillation with Swish)
    x = layers.Dense(512, activation="swish", kernel_regularizer=tf.keras.regularizers.l2(1e-4), name="head_dense_1")(x)
    x = layers.BatchNormalization(name="head_bn_1")(x)
    x = layers.Dropout(0.3, name="head_dropout_1")(x)
    
    x = layers.Dense(256, activation="swish", kernel_regularizer=tf.keras.regularizers.l2(1e-4), name="head_dense_2")(x)
    x = layers.BatchNormalization(name="head_bn_2")(x)
    x = layers.Dropout(0.25, name="head_dropout_2")(x)
    
    x = layers.Dense(128, activation="swish", kernel_regularizer=tf.keras.regularizers.l2(1e-4), name="head_dense_3")(x)
    x = layers.BatchNormalization(name="head_bn_3")(x)
    x = layers.Dropout(0.2, name="head_dropout_3")(x)
    
    # Explicit float32 dtype ensures numerical stability when mixed precision is enabled
    outputs = layers.Dense(1, activation="sigmoid", dtype="float32", name="predictions")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name=f"Authentix_{architecture}")

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
    return model, base_model, input_shape

def unfreeze_for_finetuning(model, base_model, num_layers_to_unfreeze=80, learning_rate=1e-5, label_smoothing=0.05):
    """
    Unfreezes top N layers (default 80) of base_model for Phase 2 fine-tuning.
    Recompiles model with a fine-tuning learning rate (or schedule).
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

