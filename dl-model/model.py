import tensorflow as tf
from tensorflow.keras import layers, models, metrics

def build_model(input_shape=(224, 224, 3)):
    """
    Builds an EfficientNetB0-based Deep Learning classification model.
    Initially freezes base model for Phase 1 transfer learning.
    """
    base_model = tf.keras.applications.EfficientNetB0(
        weights="imagenet",
        include_top=False,
        input_shape=input_shape
    )

    base_model.trainable = False  # Freeze base model

    inputs = layers.Input(shape=input_shape)
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(1, activation="sigmoid")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="Authentix_EfficientNetB0")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="binary_crossentropy",
        metrics=[
            "accuracy",
            metrics.Precision(name="precision"),
            metrics.Recall(name="recall"),
            metrics.AUC(name="auc")
        ]
    )
    return model, base_model

def unfreeze_for_finetuning(model, base_model, num_layers_to_unfreeze=30, learning_rate=1e-5):
    """
    Unfreezes top N layers of base_model for Phase 2 fine-tuning.
    Recompiles model with a smaller learning rate.
    """
    base_model.trainable = True
    
    # Freeze all layers except the last num_layers_to_unfreeze
    for layer in base_model.layers[:-num_layers_to_unfreeze]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss="binary_crossentropy",
        metrics=[
            "accuracy",
            metrics.Precision(name="precision"),
            metrics.Recall(name="recall"),
            metrics.AUC(name="auc")
        ]
    )
    return model
