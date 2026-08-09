import numpy as np
import tensorflow as tf

class OneCycleScheduler(tf.keras.callbacks.Callback):
    """
    OneCycle Learning Rate Policy.
    Warms up learning rate to max_lr, then decays exponentially/cosinely to min_lr.
    """
    def __init__(self, max_lr, total_steps, pct_start=0.3, div_factor=25.0, final_div_factor=10000.0):
        super().__init__()
        self.max_lr = max_lr
        self.total_steps = total_steps
        self.pct_start = pct_start
        self.div_factor = div_factor
        self.final_div_factor = final_div_factor
        self.step_num = 0
        
    def on_train_batch_begin(self, batch, logs=None):
        self.step_num += 1
        lr = self._calculate_lr()
        tf.keras.backend.set_value(self.model.optimizer.lr, lr)
        
    def _calculate_lr(self):
        step_warmup = int(self.total_steps * self.pct_start)
        initial_lr = self.max_lr / self.div_factor
        min_lr = self.max_lr / self.final_div_factor
        
        if self.step_num <= step_warmup:
            # Warm up (linear scale)
            pct = self.step_num / max(1, step_warmup)
            lr = initial_lr + pct * (self.max_lr - initial_lr)
        else:
            # Cosine annealing decay
            pct = (self.step_num - step_warmup) / max(1, self.total_steps - step_warmup)
            cos_out = 0.5 * (1.0 + np.cos(np.pi * min(1.0, pct)))
            lr = min_lr + cos_out * (self.max_lr - min_lr)
            
        return lr

def get_cosine_decay_scheduler(initial_lr, total_steps):
    """Get Keras native CosineDecay learning rate scheduler."""
    return tf.keras.optimizers.schedules.CosineDecay(
        initial_learning_rate=initial_lr,
        decay_steps=total_steps
    )
