import requests
import json
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from utils.login import login

app = Flask(__name__)

def register_routes(app):
    @app.route('/attendance', methods=['POST'])
    def submit_attendance():
        ATTENDANCE_URL = "https://student.srmap.edu.in/srmapstudentcorner/students/transaction/studentattendance.jsp"
        SUBMIT_URL = "https://student.srmap.edu.in/srmapstudentcorner/students/transaction/studentattendanceresources.jsp"
        USERNAME_l = request.json.get("un")
        USERNAME = USERNAME_l.upper()
        PASSWORD = request.json.get("pass")
        CODE = request.json.get("attendancecode")
        login_attempts, login_data = 0, { "success": False, "message": "Login Failed!", "errorCode": 0 }
        while login_attempts < 3 and not login_data["success"]:
            login_data = login(USERNAME, PASSWORD)
            login_attempts += 1
        if not login_data["success"]:
            return jsonify({"message": login_data["message"], "errorCode": 1, "success": False})
        session = login_data["session"]
        try:
            attendance_payload = { "ids": 33 }
            attendance_response = session.post(ATTENDANCE_URL, data=attendance_payload)
            if not attendance_response.ok:
                return jsonify({"message": "Attendance Request Failed", "success": False, "errorCode": 2 })
            submit_payload = {
                "acode": CODE,
                "dynamiclatdata": 0,
                "dynamiclonxdata": 0,
                "ids": 1
            }
            submit_response = session.post(SUBMIT_URL, data=submit_payload)
            soup = BeautifulSoup(submit_response.text, 'html.parser')
            json_text = soup.get_text(strip=True)
            try:
                response_data = json.loads(json_text)
                if response_data.get("resultstatus") == "1":
                    print(f"Worked For {USERNAME} ({CODE})")
                    return jsonify({
                        "message": "Attendance Captured Successfully.",
                        "success": True
                    })
                else:
                    if "Your Attendance captured al" in response_data["result"]:
                        return jsonify({ "errorCode": 3, "message": "Attendance Already Captured.", "success": False })
                    print(f"Failed For {USERNAME} ({CODE})")
                    return jsonify({ "message": "Incorrect Attendance Code.", "success": False })
            except json.JSONDecodeError:
                return jsonify({"message": "Error On Server Side!", "errorCode": 4, "success": False})
        except requests.RequestException as e:
            print("123")
            return jsonify({"message": f"Request error: {str(e)}", "success": False})
