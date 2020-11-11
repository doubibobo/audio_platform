import numpy as ny
import struct
import wave


class SoundFile:
    def __init__(self, signal):
        # https://docs.python.org/3.6/library/wave.html#wave.open
        self.file = wave.open('test.wav', 'wb')
        self.signal = signal
        self.sr = 44100

    def write(self):
        # https://docs.python.org/3.6/library/wave.html#wave.Wave_write.setparams
        self.file.setparams((1, 2, self.sr, 44100 * 4, 'NONE', 'noncompressed'))
        # https://docs.python.org/3.6/library/wave.html#wave.Wave_write.writeframes
        self.file.writeframes(self.signal)
        self.file.close()


# signal settings
duration = 4  # duration in Seconds
samplerate = 44100  # Hz (frequency)
samples = duration * samplerate  # aka samples per second
frequency = 440  # Hz
period = samplerate / float(frequency)  # of samples
omega = ny.pi * 2 / period  # calculate omega (angular frequency)
volume = 16384  # 16384 is the volume measure (max is 32768)

# create sin wave
xaxis = ny.arange(samples, dtype=ny.float)
ydata = volume * ny.sin(xaxis * omega)

# fill blanks
signal = ny.resize(ydata, (samples,))

# create sound file
f = SoundFile(signal)
f.write()

print('sound file created')
