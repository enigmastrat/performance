import json
from flask import Flask, request, send_from_directory


app = Flask(__name__,
            static_url_path="",
            static_folder="web",)

dancers = [
    {"id": 0, "name": "Charlotte"},
    {"id": 1, "name": "Chloe"}
]

groups = [
    {"id":0, "name": "Ovation", "members": [0]},
    {"id":1, "name": "Encore", "members": [1]},
]

acts = [
    {"id": 0, "name": "Like a Prayer", "participants": {"groups":[1], "individuals":[0]}},
    {"id": 1, "name": "Steppin Time", "participants": {"groups":[0], "individuals":[]}},
    {"id": 2, "name": "Holy Sound", "file": "HolySound.mp3", "participants": {}},
]

notes = [
    {"id":0, "act_id": 2, "startTime": 0, "endTime": 10, "note": "Song starts"},
    {"id":1, "act_id": 2, "startTime": 4, "endTime": 10, "note": "Guitar and Drums Start playing"},
    {"id":2, "act_id": 2, "startTime": 7, "endTime": 15, "note": "Lead line"},
    {"id":3, "act_id": 2, "startTime": 13, "endTime": 21, "note": "Lead line #2"},
    {"id":4, "act_id": 2, "startTime": 18.2, "endTime": 25, "note": "Lead line #3"},
    {"id":5, "act_id": 2, "startTime": 26, "endTime": 35, "note": "Verse 1"},
    {"id":6, "act_id": 2, "startTime": 72, "endTime": 82, "note": "Verse 2"},
]

organization = {
    "name": "Bravo",
    "members": dancers,
}


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

@app.route("/dancers/<int:id>", methods=["GET"])
def get_dancer(id):
    dancer = list(filter(lambda x: x["id"] == id, dancers))[0]
    return json.dumps(dancer)

@app.route("/dancers/<int:id>", methods=["PUT","POST"])
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
@app.route("/groups/<int:id>", methods=["GET"])
def get_group(id):
    group = list(filter(lambda x: x["id"] == id, groups))[0]
    return json.dumps(group)
@app.route("/groups/<int:id>", methods=["PUT","POST"])
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
    return json.dumps(acts)
@app.route("/acts", methods=["POST"])
def add_acts():
    act = request.json
    act["id"] = (acts[-1]["id"]+1) if len(acts) > 0 else 0
    acts.append(act)

    return json.dumps(acts)
@app.route("/acts/<int:id>", methods=["GET"])
def get_act(id):
    act = list(filter(lambda x: x["id"] == id, acts))[0]
    return json.dumps(act)
@app.route("/acts/<int:id>", methods=["PUT","POST"])
def update_act(id):
    old_act = list(filter(lambda x: x["id"] == id, acts))[0]
    new_act = request.json

    # Don't let the user change the id
    new_act["id"] = id

    # Update the dancer
    old_act.update(new_act)

    return json.dumps(acts)

# Notes
@app.route("/acts/<int:id>/notes", methods=["GET"])
def get_notes(id):
    filtered_notes = list(filter(lambda x: x["act_id"] == id, notes))
    return json.dumps(filtered_notes)
@app.route("/acts/<int:act_id>/notes", methods=["POST"])
def add_note(act_id):
    note = request.json
    note["id"] = (notes[-1]["id"]+1) if len(notes) > 0 else 0
    note["act_id"] = act_id
    notes.append(note)

    return json.dumps(acts)
@app.route("/acts/<int:act_id>/notes/<int:id>", methods=["GET"])
def get_note(act_id, id):
    note = list(filter(lambda x: x["id"] == id and x["act_id"] == act_id, notes))[0]
    return json.dumps(note)
@app.route("/acts/<int:act_id>/notes/<int:id>", methods=["PUT","POST"])
def update_note(act_id, id):
    old_note = list(filter(lambda x: x["id"] == id and x["act_id"] == act_id, notes))[0]
    new_note = request.json

    # Don't let the user change the id
    new_note["id"] = id
    new_note["act_id"] = act_id

    # Update the item
    old_note.update(new_note)

    return json.dumps(notes)
@app.route("/acts/<int:act_id>/notes/<int:id>", methods=["DELETE"])
def delete_note(act_id, id):
    note = list(filter(lambda x: x["id"] == id and x["act_id"] == act_id, notes))[0]

    notes.remove(note)

    return json.dumps(note)


@app.route("/")
def root():
    return app.send_static_file("index.html")

@app.route("/js/<path:path>")
def send_js(path):
    return send_from_directory("web/js", path)

if __name__ == "__main__":
    app.run(host="0.0.0.0")
