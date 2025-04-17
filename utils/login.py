from utils.captcha import solve_captcha
import requests
from bs4 import BeautifulSoup

def login(username, password):
    with requests.Session() as session:
        session.headers.update({"User-Agent": "Mozilla/5.0"})
        try:
            session.get("https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage")
            captcha_response = session.get("https://student.srmap.edu.in/srmapstudentcorner/captchas")
            captcha_text = solve_captcha(captcha_response.content)
            if not captcha_text:
                return {"success": False, "message": "Captcha solving failed."}
            payload = {
                "UserName": username,
                "AuthKey": password,
                "ccode": captcha_text,
                "txtUserName": username,
                "txtAuthKey": password
            }
            login_response = session.post(
                "https://student.srmap.edu.in/srmapstudentcorner/StudentLoginToPortal", data=payload
            )
            soup = BeautifulSoup(login_response.text, "html.parser")
            name_element = soup.select_one(".profile_info h2")
            if name_element:
                return {"success": True, "name": name_element.text.strip(), "session": session}
            return {"success": False, "message": "Invalid Credentials."}
        except requests.RequestException as e:
            print(f"Login error: {e}")
            return {"success": False, "message": "Login Failed!"}