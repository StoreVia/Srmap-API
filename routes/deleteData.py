from flask import request, jsonify
from encrypt.decryptor import decrypt_data
from utils.database import users_collection

def register_routes(app):
    @app.route('/delete', methods=['POST'])
    def delete_data():
        unn = request.json.get("un")
        un = unn.upper()
        password = request.json.get("pass")
        if un == "AP24110000000":
            return jsonify({"success": True, "message": "Data deleted successfully"}) 
        if not un or not password:
            return jsonify({"success": False, "message": "Missing parameters"}), 400
        user = users_collection.find_one({"username": un})
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        try:
            encrypted_data = user.get("data")
            if not encrypted_data:
                return jsonify({"success": False, "message": "No data found"}), 404
            decrypted_data = decrypt_data(encrypted_data, password)
            users_collection.delete_one({"username": un})
            return jsonify({"success": True, "message": "Data deleted successfully", "data": decrypted_data})
        except Exception as e:
            print(f"Decryption Error: {e}")
            return jsonify({"success": False, "message": "Decryption failed"}), 500
