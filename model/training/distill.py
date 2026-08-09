import tensorflow as tf
from tensorflow.keras import layers

class Distiller(tf.keras.Model):
    """
    Knowledge Distillation class wrapper.
    Trains student network utilizing teacher soft-logits and ground-truth hard labels.
    """
    def __init__(self, student, teacher, alpha=0.3, temperature=3.0):
        super().__init__()
        self.student = student
        self.teacher = teacher
        self.alpha = alpha
        self.temperature = temperature
        
    def compile(self, optimizer, metrics):
        super().compile()
        self.optimizer = optimizer
        self.student_metrics = metrics
        
    def train_step(self, data):
        # Unpack inputs and integer labels
        x, y = data
        
        with tf.GradientTape() as tape:
            # Student model forward pass (trainable)
            student_preds = self.student(x, training=True)
            
            # 1. Hard label loss: Categorical Cross-Entropy against original targets
            # Since labels y are integers, we convert to one-hot for uniform cross entropy
            num_classes = tf.shape(student_preds)[-1]
            y_onehot = tf.one_hot(y, depth=num_classes)
            
            student_loss = tf.reduce_mean(
                tf.keras.losses.categorical_crossentropy(y_onehot, student_preds)
            )
            
            # 2. Distillation loss
            if self.alpha > 0.0:
                # Teacher model forward pass (frozen)
                teacher_preds = self.teacher(x, training=False)
                # Soft target distillation loss: Scaled softmax output matching
                teacher_logits = tf.math.log(teacher_preds + 1e-10)
                student_logits = tf.math.log(student_preds + 1e-10)
                
                soft_teacher = tf.nn.softmax(teacher_logits / self.temperature)
                soft_student = tf.nn.softmax(student_logits / self.temperature)
                
                distill_loss = tf.reduce_mean(
                    tf.keras.losses.categorical_crossentropy(soft_teacher, soft_student)
                )
                loss = self.alpha * distill_loss + (1.0 - self.alpha) * student_loss
            else:
                distill_loss = tf.constant(0.0)
                loss = student_loss
            
        gradients = tape.gradient(loss, self.student.trainable_variables)
        self.optimizer.apply_gradients(zip(gradients, self.student.trainable_variables))
        
        # Update metrics
        for metric in self.student_metrics:
            metric.update_state(y_onehot, student_preds)
            
        results = {m.name: m.result() for m in self.student_metrics}
        results["loss"] = loss
        results["student_loss"] = student_loss
        results["distill_loss"] = distill_loss
        return results

    def test_step(self, data):
        x, y = data
        student_preds = self.student(x, training=False)

        num_classes = tf.shape(student_preds)[-1]
        y_onehot = tf.one_hot(y, depth=num_classes)

        # Hard label loss
        student_loss = tf.reduce_mean(
            tf.keras.losses.categorical_crossentropy(y_onehot, student_preds)
        )

        # Soft distillation loss
        if self.alpha > 0.0:
            teacher_preds = self.teacher(x, training=False)
            teacher_logits = tf.math.log(teacher_preds + 1e-10)
            student_logits = tf.math.log(student_preds + 1e-10)
            soft_teacher = tf.nn.softmax(teacher_logits / self.temperature)
            soft_student = tf.nn.softmax(student_logits / self.temperature)
            distill_loss = tf.reduce_mean(
                tf.keras.losses.categorical_crossentropy(soft_teacher, soft_student)
            )
            loss = self.alpha * distill_loss + (1.0 - self.alpha) * student_loss
        else:
            distill_loss = tf.constant(0.0)
            loss = student_loss

        for metric in self.student_metrics:
            metric.update_state(y_onehot, student_preds)

        results = {m.name: m.result() for m in self.student_metrics}
        results["loss"] = loss
        results["student_loss"] = student_loss
        results["distill_loss"] = distill_loss
        return results

