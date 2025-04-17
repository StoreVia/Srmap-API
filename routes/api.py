from flask import request, jsonify
from datetime import datetime
from utils.login import login
from utils.fetchData import fetch_from_website
from encrypt.encryptor import encrypt_data
from encrypt.decryptor import decrypt_data
from utils.database import users_collection

def register_routes(app):
    @app.route('/api', methods=['GET'])
    def get_data():
        payload = request.get_json(silent=True) or {}
        un = request.cookies.get("un") or payload.get("username", "")
        password = request.cookies.get("pass") or payload.get("password", "")
        request_type = request.args.get('type')
        if not un or not password or not request_type:
            return jsonify({"success": False, "message": "Missing parameters"}), 400
        if request_type not in ["website", "db", "discord"]:
            return jsonify({"success": False, "message": "Invalid type"}), 400
        if un == "AP24110000000":
            print(f"[{datetime.now()}] User: {un}, Request Type: {request_type}")
            user = users_collection.find_one({"username": "AP24110000000"})
            data = decrypt_data(user["data"], password)
            return jsonify({"success": True, "data": data, "limit": user.get("limit", 5), "source": "db"})
        un = un.upper()
        print(f"[{datetime.now()}] User: {un}, Request Type: {request_type}")
        user = users_collection.find_one({"username": un})
        last_updated = user["updated_at"] if user else None
        limit = user.get("limit", 5) if user else 5
        current_time = datetime.now().strftime('%Y-%m-%d')
        if not user or not last_updated or (current_time != last_updated) or (datetime.now().hour >= 3 and last_updated.split(" ")[0] != datetime.now().strftime('%Y-%m-%d')):
            login_result = login(un, password)
            if not login_result["success"]:
                return jsonify(login_result), 401
            session = login_result["session"]
            data = fetch_from_website(session)
            if not data:
                return jsonify({"success": False, "message": "Failed To Fetch Data!"}), 500
            encrypted_data = encrypt_data(data, password)
            limit = 5
            users_collection.update_one(
                {"username": un},
                {"$set": {"data": encrypted_data, "updated_at": current_time, "limit": limit}},
                upsert=True
            )
            return jsonify({"success": True, "data": data, "limit": limit, "source": "website"})
        if request_type == "website":
            if limit > 0:
                login_result = login(un, password)
                if not login_result["success"]:
                    return jsonify(login_result), 401
                session = login_result["session"]
                data = fetch_from_website(session)
                if not data:
                    return jsonify({"success": False, "message": "Failed To Fetch Data!"}), 500
                encrypted_data = encrypt_data(data, password)
                limit -= 1
                users_collection.update_one(
                    {"username": un},
                    {"$set": {"data": encrypted_data, "updated_at": current_time, "limit": limit}}
                )
                return jsonify({"success": True, "data": data, "limit": limit, "source": "website"})
            else:
                return jsonify({"success": False, "message": "Limit Reached!"}), 429
        elif request_type == "db":
            if user and "data" in user:
                try:
                    data = decrypt_data(user["data"], password)
                except Exception as e:
                    print(f"Decryption Error: {e}")
                    return jsonify({"success": False, "message": "Decryption Failed!"}), 500
                return jsonify({"success": True, "data": data, "limit": limit, "source": "database"})
            else:
                return jsonify({"success": False, "message": "No Data Found In Database!"}), 404
        elif request_type == "discord":
            login_result = login(un, password)
            if not login_result["success"]:
                return jsonify(login_result), 401
            session = login_result["session"]
            data = fetch_from_website(session)
            if not data:
                return jsonify({"success": False, "message": "Failed To Fetch Data!"}), 500
            encrypted_data = encrypt_data(data, password)
            limit -= 1
            users_collection.update_one(
                {"username": un},
                {"$set": {"data": encrypted_data, "updated_at": current_time, "limit": limit}}
            )
            return jsonify({"success": True, "data": data, "limit": limit, "source": "website"})