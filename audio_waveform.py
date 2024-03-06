
try:
    import librosa
except ModuleNotFoundError:
    print("librosa not installed, won't be able to generate waveforms")
    librosa = None

import numpy as np
import matplotlib.pyplot as plt
import os


def generate_waveform(file_path, output_file_name="testplot.png"):
    if librosa is None or os.environ.get("WAVEFORM_DISABLED", False):
        return

    file = librosa.load(file_path, sr=750)
    audio = file[0]
    sample_rate = file[1]
    n_samples = len(audio)
    t_audio = n_samples/sample_rate

    # Not sure if this really does anything here...
    signal_array = np.frombuffer(audio, dtype=np.float32)

    times = np.linspace(0, t_audio, n_samples)


    plt.figure(figsize=(40, 2.5))
    plt.plot(times, audio)
    #plt.title('audio')
    #plt.ylabel('Signal Value')
    #plt.xlabel('Time (s)')
    plt.xlim(0, t_audio)
    plt.grid(False)
    plt.axis('off')

    plt.subplots_adjust(top = 1, bottom = 0, right = 1, left = 0, hspace = 0, wspace = 0)
    plt.margins(0,0)


    #plt.show()
    plt.savefig(output_file_name, transparent = True,)

def main():
    generate_waveform("web/HolySound.mp3")

if __name__ == "__main__":
    main()
