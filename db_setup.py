
from pysondb import db


dancer_db = db.getDb("data/dancers.json")
group_db = db.getDb("data/groups.json")
act_db = db.getDb("data/acts.json")
note_db = db.getDb("data/notes.json")
organization_db = db.getDb("data/organizations.json")
user_db = db.getDb("data/users.json")


dancers = [
    {"name": "Charlotte"},
    {"name": "Chloe"}
]
dancer_db.addMany(dancers)
dancers = dancer_db.getAll()

# TODO needs work
#organization = {
#    "name": "Bravo",
#    "members": dancers,
#}
#organization_db.addMany(organization)


users = [
    {
        "email": "test@test.test",
        "password": "secret"
    },{
        "email": "a",
        "password": "a"
    },
]
user_db.addMany(users)
users = user_db.getAll()

groups = [
    {"name": "Ovation", "members": [dancers[0]["id"]]},
    {"name": "Encore", "members": [dancers[1]["id"]]},
]
group_db.addMany(groups)
groups = group_db.getAll()

acts = [
    {"name": "Holy Sound", "file": "HolySound.mp3", "waveform": "HolySound.png", "owner_id": users[0]["id"], "participants": {}},
]
act_db.addMany(acts)
acts = act_db.getAll()

notes = [
    {"act_id": acts[0]["id"], "startTime": 0, "endTime": 10, "note": "Song starts"},
    {"act_id": acts[0]["id"], "startTime": 4, "endTime": 10, "note": "Guitar and Drums Start playing"},
    {"act_id": acts[0]["id"], "startTime": 7, "endTime": 15, "note": "Lead line"},
    {"act_id": acts[0]["id"], "startTime": 13, "endTime": 21, "note": "Lead line #2"},
    {"act_id": acts[0]["id"], "startTime": 18.2, "endTime": 25, "note": "Lead line #3"},
    {"act_id": acts[0]["id"], "startTime": 26, "endTime": 35, "note": "Verse 1"},
    {"act_id": acts[0]["id"], "startTime": 72, "endTime": 82, "note": "Verse 2"},
]
note_db.addMany(notes)
