import requests
import json
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from utils.login import login

app = Flask(__name__)

def register_routes(app):
    @app.route('/feedback', methods=['GET'])
    def submit_feedback():
        FEEDBACK_PAGE_URL = "https://student.srmap.edu.in/srmapstudentcorner/students/transaction/subjectwisefeedback.jsp"
        FETCH_FEEDBACK_FORM_URL = "https://student.srmap.edu.in/srmapstudentcorner/students/transaction/subjectwisefeedbackresources.jsp"
        SUBMIT_FEEDBACK_URL = "https://student.srmap.edu.in/srmapstudentcorner/students/transaction/subjectwisefeedbackresources.jsp"
        USERNAME = request.args.get("username", "")
        PASSWORD = request.args.get("password", "")
        session = requests.Session()
        login_attempts, login_data = 0, {"success": False, "message": "Login failed"}
        while login_attempts < 3 and not login_data["success"]:
            login_data = login(USERNAME, PASSWORD)
            login_attempts += 1
        if not login_data["success"]:
            return jsonify({"message": login_data["message"], "errorCode": "2", "success": False})
        session.cookies.update(login_data["session"].cookies)
        session.headers.update({"Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0"})
        subject_response = session.post(FEEDBACK_PAGE_URL, data={"ids": "9"})
        soup = BeautifulSoup(subject_response.text, "html.parser")
        subject_ids = [td["id"] for td in soup.find_all("td", {"class": "clsSubject"})]
        mcontroller_value = soup.find("input", {"id": "mcontroller"}).get("value", "")
        if not subject_ids:
            return jsonify({"message": "No subjects found", "errorCode": "1", "success": False})
        success_flag = False
        for subject_id in subject_ids:
            form_response = session.post(FETCH_FEEDBACK_FORM_URL, data={"ids": "1", "filter": subject_id, "controller": mcontroller_value})
            if form_response.status_code != 200:
                continue
            form_soup = BeautifulSoup(form_response.text, "html.parser")
            hdn_controller_id = form_soup.find("input", {"id": "hdnControllerId"}).get("value", "")
            questions = form_soup.find_all("tr", class_="clsquestions")
            answers_json = []
            for question in questions[:20]:
                question_id = question.get("id")
                answer_input = question.find("input", class_="answers", attrs={"checked": True})
                if question_id and answer_input:
                    answers_json.append({
                        "questionid": question_id,
                        "answerid": answer_input.get("id"),
                        "answerdesc": "Strongly agree",
                        "quesid": question_id,
                        "partid": answer_input.get("partid"),
                        "answervalue": answer_input.get("answervalue"),
                        "pointvalue": answer_input.get("pointvalue")
                    })
            descriptive_json = [
                {"questionid": str(int(q["questionid"]) + 1), "answerdesc": "No comments", "quesid": q["quesid"], "partid": "6"}
                for q in answers_json[:5]
            ]
            submission_payload = {
                "hdnControllerId": hdn_controller_id,
                "hdnSubjectId": subject_id,
                "ids": "2",
                "answers": json.dumps(answers_json, ensure_ascii=False),
                "descriptiveanswer": json.dumps(descriptive_json, ensure_ascii=False),
                "feedbacktype": "2",
                "txtRemarks": "-",
                "filter": "",
                "remarks": "-"
            }
            submit_response = session.post(SUBMIT_FEEDBACK_URL, data=submission_payload)
            try:
                if submit_response.json().get("result") == "Feedback Completed":
                    success_flag = True
            except ValueError:
                pass
        if success_flag == True:
            print(f"Report Submitted For {USERNAME}")
        return jsonify({"message": "Feedback submitted successfully", "success": True} if success_flag else {"message": "Feedback submission failed", "success": False})