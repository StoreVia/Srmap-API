from flask import request, jsonify
from utils.database import users_collection

def register_routes(app):
    @app.route('/checkLimit')
    def check_limit():
        unn = request.cookies.get("un")
        un = unn.upper()
        if not un:
            return jsonify({"success": False, "message": "User not logged in"}), 401
        user = users_collection.find_one({"username": un}, {"_id": 0, "limit": 1})
        if user:
            return jsonify({"success": True, "limit": user.get("limit", 0)})
        return jsonify({"success": False, "message": "User not found"}), 404
