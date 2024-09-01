import flask
import sound_generator

app = flask.Flask(__name__)    

@app.route("/", methods=["GET"])
def handle_main_view():
    return flask.send_from_directory("static","index.html")

app.run()

