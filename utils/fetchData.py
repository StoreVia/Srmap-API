from bs4 import BeautifulSoup
import requests

def fetch_from_website(session):
    try:
        responseOriginal = session.post("https://student.srmap.edu.in/srmapstudentcorner/HRDSystem")
        responseAttendance = session.post(
            "https://student.srmap.edu.in/srmapstudentcorner/students/report/studentreportresources.jsp",
            data={"ids": "3"}
        )
        responseTimetable = session.post(
            "https://student.srmap.edu.in/srmapstudentcorner/students/report/studentreportresources.jsp",
            data={"ids": "10"}
        )
        responseSubjects = session.post(
            "https://student.srmap.edu.in/srmapstudentcorner/students/report/studentreportresources.jsp",
            data={"ids": "2"}
        )
        responseProfile = session.post(
            "https://student.srmap.edu.in/srmapstudentcorner/students/report/studentreportresources.jsp",
            data={"ids": "1"}
        )

        soupOriginal = BeautifulSoup(responseOriginal.text, "html.parser")
        soupAttendance = BeautifulSoup(responseAttendance.text, "html.parser")
        soupTimetable = BeautifulSoup(responseTimetable.text, "html.parser")
        soupSubjects = BeautifulSoup(responseSubjects.text, "html.parser")
        soupProfile = BeautifulSoup(responseProfile.text, "html.parser")

        attendance_data = []
        timetable_data = []
        profile_data = []
        subject_details = []

        subject_semester_map = {}
        for row in soupSubjects.select("table.table-striped tr"):
            columns = row.find_all("td")
            if len(columns) == 5:
                code = columns[1].text.strip()
                semester = columns[0].text.strip()
                credit = columns[3].text.strip()
                subject_semester_map[code] = {
                    "semester": semester,
                    "credit": credit
                }

        for row in soupAttendance.select("table#tblSubjectWiseAttendance tr"):
            columns = row.find_all("td")
            if len(columns) == 9:
                attendance_data.append({
                    "subject_code": columns[0].text.strip(),
                    "subject_name": columns[1].text.strip(),
                    "classes_conducted": columns[2].text.strip(),
                    "present": columns[3].text.strip(),
                    "absent": columns[4].text.strip(),
                    "present_percentage": columns[5].text.strip(),
                    "od_ml_taken": columns[6].text.strip(),
                    "od_ml_percentage": columns[7].text.strip(),
                    "attendance_percentage": columns[8].text.strip(),
                })

        raw_timetable = []
        for row in soupTimetable.find_all('tr')[2:]:
            cells = row.find_all('td')
            if len(cells) > 1:
                day = cells[0].get_text(strip=True)
                subjects = [cell.get_text(strip=True) for cell in cells[1:]]
                raw_timetable.append({"day": day, "subjects": subjects})

        for day_entry in raw_timetable[:5]:
            timetable_data.append({
                "day": day_entry["day"],
                "subjects": day_entry["subjects"]
            })

        for item in raw_timetable[7:]:
            if len(item["subjects"]) >= 4:
                subject_code = item["day"]
                name = item["subjects"][0]
                ltp = item["subjects"][1]
                faculty = item["subjects"][2]
                classrooms = item["subjects"][3]
                semester = subject_semester_map.get(subject_code, {}).get("semester", "")
                credit = subject_semester_map.get(subject_code, {}).get("credit", "")

                subject_details.append({
                    "code": subject_code,
                    "name": name,
                    "ltp": ltp,
                    "credit": credit,
                    "semester": semester,
                    "faculty": faculty,
                    "classrooms": classrooms
                })

        for row in soupProfile.select("table.table-striped tr"):
            columns = row.find_all("td")
            if len(columns) == 3:
                key = columns[0].text.strip()
                value = columns[2].text.strip()
                if "Student Name" in key:
                    profile_data.append({"Student Name": value})
                elif "Register No." in key:
                    profile_data.append({"Register No.": value})
                elif "Institution" in key:
                    profile_data.append({"Institution": value})
                elif "Semester" in key:
                    profile_data.append({"Semester": value})
                elif "Program / Section" in key:
                    profile_data.append({"Program / Section": value})
                elif "Specialization" in key:
                    profile_data.append({"Specialization": value})
                elif "D.O.B. / Gender" in key:
                    profile_data.append({"D.O.B. / Gender": value})

        profile_pic_element = soupOriginal.select_one("div.profile_pic img")
        if profile_pic_element and profile_pic_element.has_attr("src"):
            profile_pic_url = "https://student.srmap.edu.in" + profile_pic_element["src"]
            profile_data.append({"picture": profile_pic_url})

        return {
            "attendance": attendance_data,
            "timetable": timetable_data,
            "subjects": subject_details,
            "profile": profile_data
        }

    except requests.RequestException as e:
        print(f"Data Fetch Error: {e}")
        return None
