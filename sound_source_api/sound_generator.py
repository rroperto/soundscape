from gtts import gTTS

class SoundGenerator():
    def create(filepath, text_content, language="en"):
        sound_object = gTTS(text=text_content, lang=language, slow=False)
        sound_object.save(filepath)