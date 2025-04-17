from flask import request, jsonify
import requests
import os

DiscordWebHook = os.getenv("discordhook")

def register_routes(app):
    @app.route('/report', methods=['POST'])
    def report_bug():
        try:
            data = request.json
            title = data.get('title')
            username = data.get("user")
            bug_description = data.get("reason")
            timestamp = data.get("time")
            id = data.get("id")
            if not username or not bug_description:
                return jsonify({"success": False, "message": "Username Or Description Not Found."}), 400
            embed_message = {
                "embeds": [{
                    "title": f"{username} ({title})",
                    "description": bug_description,
                    "color": 5814783,
                    "footer": {
                        "text": f"{timestamp}"
                    }
                }]
            }
            if id:
                embed_message["embeds"][0]["fields"] = [{
                    "name": "Email",
                    "value": f"> {data.get('id')}",
                    "inline": False
                }]
            response = requests.post(DiscordWebHook, json=embed_message)
            if response.status_code == 204:
                return jsonify({"success": True, "message": "Bug Reported Successfully!"})
            else:
                return jsonify({"success": False, "message": "Failed To Send Data To Discord Webhook"}), 500

        except Exception as e:
            return jsonify({"success": False, "message": str(e)}), 500