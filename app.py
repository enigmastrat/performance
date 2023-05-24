import json
import os
import hashlib
import uuid

from flask import Flask, request, send_from_directory, session, redirect
from werkzeug.utils import secure_filename

from audio_waveform import generate_waveform

UPLOAD_FOLDER = os.path.join('web','songs')
UPLOAD_FOLDER_RELATIVE = 'songs'
ALLOWED_EXTENSIONS = {'mp3'}
app = Flask(__name__,
            static_url_path="",
            static_folder="web",)
app.secret_key = "This is a super secret random secret key"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

dancers = [
    {"id": 0, "name": "Charlotte"},
    {"id": 1, "name": "Chloe"}
]

groups = [
    {"id":0, "name": "Ovation", "members": [0]},
    {"id":1, "name": "Encore", "members": [1]},
]

act_0_id = str(uuid.uuid4())
act_1_id = str(uuid.uuid4())
act_2_id = str(uuid.uuid4())

acts = [
    {"id": act_0_id, "name": "Like a Prayer", "owner_id": 1, "participants": {"groups":[1], "individuals":[0]}},
    {"id": act_1_id, "name": "Steppin Time", "owner_id": 0, "participants": {"groups":[0], "individuals":[]}},
    {"id": act_2_id, "name": "Holy Sound", "file": "HolySound.mp3", "waveform": "HolySound.png", "owner_id": 0, "participants": {}},
]

notes = [
    {"id":str(uuid.uuid4()), "act_id": act_2_id, "startTime": 0, "endTime": 10, "note": "Song starts"},
    {"id":str(uuid.uuid4()), "act_id": act_2_id, "startTime": 4, "endTime": 10, "note": "Guitar and Drums Start playing"},
    {"id":str(uuid.uuid4()), "act_id": act_2_id, "startTime": 7, "endTime": 15, "note": "Lead line"},
    {"id":str(uuid.uuid4()), "act_id": act_2_id, "startTime": 13, "endTime": 21, "note": "Lead line #2"},
    {"id":str(uuid.uuid4()), "act_id": act_2_id, "startTime": 18.2, "endTime": 25, "note": "Lead line #3"},
    {"id":str(uuid.uuid4()), "act_id": act_2_id, "startTime": 26, "endTime": 35, "note": "Verse 1"},
    {"id":str(uuid.uuid4()), "act_id": act_2_id, "startTime": 72, "endTime": 82, "note": "Verse 2"},
]

organization = {
    "name": "Bravo",
    "members": dancers,
}

users = [
    {
        "id": 0,
        "email": "test@test.test",
        "password": "secret"
    },{
        "id": 1,
        "email": "a",
        "password": "a"
    },
]

# TODO make this stronger
def is_logged_in():
    return "user_email" in session and session["user_email"] is not None

@app.route("/login", methods=["POST"])
def login():

    user = request.json
    password = user["password"]
    email = user["email"]

    filtered_users = list(filter(lambda x: x["email"] == email and x["password"] == password, users))
    if (len(filtered_users) > 0):
        # TODO not sure if flask sessions are secure
        session["user_id"] = list(filtered_users)[0]["id"]
        session["user_email"] = email
        return ("Success", 200)
    return ("Login denied", 403)

@app.route("/organization", methods=["GET"])
def get_organization():
    return json.dumps(organization)

@app.route("/dancers", methods=["GET"])
def get_dancers():
    return json.dumps(dancers)
@app.route("/dancers", methods=["POST"])
def add_dancer():
    dancer = request.json
    dancer["id"] = (dancers[-1]["id"]+1) if len(dancers) > 0 else 0
    dancers.append(dancer)

    return json.dumps(dancers)

@app.route("/dancers/<id>", methods=["GET"])
def get_dancer(id):
    dancer = list(filter(lambda x: x["id"] == id, dancers))[0]
    return json.dumps(dancer)

@app.route("/dancers/<id>", methods=["PUT","POST"])
def update_dancer(id):
    old_dancer = list(filter(lambda x: x["id"] == id, dancers))[0]
    new_dancer = request.json

    # Don't let the user change the id
    new_dancer["id"] = id

    # Update the dancer
    old_dancer.update(new_dancer)

    return json.dumps(dancers)


@app.route("/groups", methods=["GET"])
def get_groups():
    return json.dumps(groups)
@app.route("/groups", methods=["POST"])
def add_groups():
    group = request.json
    group["id"] = (groups[-1]["id"]+1) if len(groups) > 0 else 0
    groups.append(group)

    return json.dumps(groups)
@app.route("/groups/<id>", methods=["GET"])
def get_group(id):
    group = list(filter(lambda x: x["id"] == id, groups))[0]
    return json.dumps(group)
@app.route("/groups/<id>", methods=["PUT","POST"])
def update_group(id):
    old_group = list(filter(lambda x: x["id"] == id, groups))[0]
    new_group = request.json

    # Don't let the user change the id
    new_group["id"] = id

    # Update the dancer
    old_group.update(new_group)

    return json.dumps(groups)


@app.route("/acts", methods=["GET"])
def get_acts():
    if not is_logged_in():
        redirect("/login.html", code=403)

    user_id = session["user_id"]

    return json.dumps(list(filter(lambda x: x["owner_id"] == user_id, acts)))
@app.route("/acts", methods=["POST"])
def add_acts():
    if not is_logged_in():
        redirect("/login.html", code=403)

    user_id = session["user_id"]

    act = request.json
    act["id"] = str(uuid.uuid4())
    act["owner_id"] = user_id
    acts.append(act)

    return json.dumps(act)
@app.route("/acts/<id>", methods=["GET"])
def get_act(id):
    act = list(filter(lambda x: x["id"] == id, acts))[0]
    return json.dumps(act)
@app.route("/acts/<id>", methods=["PUT","POST"])
def update_act(id):
    old_act = list(filter(lambda x: x["id"] == id, acts))[0]
    new_act = request.json

    # Don't let the user change the id
    new_act["id"] = id

    # Update the dancer
    old_act.update(new_act)

    return json.dumps(acts)
@app.route("/acts/<id>", methods=["DELETE"])
def delete_act(id):
    act = list(filter(lambda x: x["id"] == id, acts))[0]
    acts.remove(act)
    #TODO delete everything associated with the act (Notes and files)
    return json.dumps(act)
# Notes
@app.route("/acts/<id>/notes", methods=["GET"])
def get_notes(id):
    filtered_notes = list(filter(lambda x: x["act_id"] == id, notes))
    return json.dumps(filtered_notes)
@app.route("/acts/<act_id>/notes", methods=["POST"])
def add_note(act_id):
    note = request.json
    note["id"] = str(uuid.uuid4())
    note["act_id"] = act_id
    notes.append(note)

    return json.dumps(acts)
@app.route("/acts/<act_id>/notes/<id>", methods=["GET"])
def get_note(act_id, id):
    note = list(filter(lambda x: x["id"] == id and x["act_id"] == act_id, notes))[0]
    return json.dumps(note)
@app.route("/acts/<act_id>/notes/<id>", methods=["PUT","POST"])
def update_note(act_id, id):
    old_note = list(filter(lambda x: x["id"] == id and x["act_id"] == act_id, notes))[0]
    new_note = request.json

    # Don't let the user change the id
    new_note["id"] = id
    new_note["act_id"] = act_id

    # Update the item
    old_note.update(new_note)

    return json.dumps(notes)
@app.route("/acts/<act_id>/notes/<id>", methods=["DELETE"])
def delete_note(act_id, id):
    note = list(filter(lambda x: x["id"] == id and x["act_id"] == act_id, notes))[0]

    notes.remove(note)

    return json.dumps(note)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
@app.route("/acts/<id>/file", methods=["POST"])
def upload_audio_file(id):
    act = list(filter(lambda x: x["id"] == id, acts))[0]
    file = request.files['file']
    if file and allowed_file(file.filename):
        print(file.filename)
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Process file # This seems convoluted... must be a better way
        waveform_img_filename = filename.removesuffix("."+filename.split(".")[-1]) + ".png"
        waveform_img_path = os.path.join(app.config['UPLOAD_FOLDER'], waveform_img_filename)
        generate_waveform(file_path, output_file_name=waveform_img_path)
        # Add file to act
        act["file"] = os.path.join(UPLOAD_FOLDER_RELATIVE, filename)
        act["waveform"] = os.path.join(UPLOAD_FOLDER_RELATIVE, waveform_img_filename)

    return json.dumps(act)


@app.route("/")
def root():
    if is_logged_in():
        return app.send_static_file("index.html")
    else:
        return app.send_static_file("login.html")

@app.route("/js/<path:path>")
def send_js(path):
    return send_from_directory("web/js", path)

if __name__ == "__main__":
    app.run(host="0.0.0.0")
