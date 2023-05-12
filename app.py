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
    {"id": 0, "name": "Steppin Time", "participants": {"groups":[0], "individuals":[]}},
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

@app.route("/")
def root():
    return app.send_static_file("index.html")

@app.route("/js/<path:path>")
def send_js(path):
    return send_from_directory("web/js", path)

if __name__ == "__main__":
    app.run()
