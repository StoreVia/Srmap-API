async function submitFeedBack(){
    try {
        showLoading();
        let username = getCookie("un");
        let password = getCookie("pass")
        if (!username || !password) {
            alert("Username or password not found in cookies.");
            return;
        }
        const response = await fetch(`/feedback?username=${username}&password=${password}`);
        const result = await response.json();
        hideLoading();
        if(result.success === true){
            console.log(result)
            alert("Feedback Submitted!");
        } else {
            if(result.errorCode === "1"){
                alert("Feedback Already Submitted")
            } else {
                alert("Login Failed. Once Again Cross Check Credentials With Student Portal Credentials.")
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch data.');
    }
}
(function () {
    document.addEventListener("contextmenu", (event) => event.preventDefault());
})();
function selectOption(selectedButton, type) {
    document.querySelectorAll('.toggle-button').forEach(button => {
        button.classList.remove('active');
    });
    selectedButton.classList.add('active');
    if (type === 'Contact') {
        document.getElementById('bugDescription').placeholder = 'Reason To Contact...';
        document.getElementById('emailField').style.display = 'flex';
    } else {
        if(type === 'Suggest') document.getElementById('bugDescription').placeholder = 'Your Suggestion....';
        if(type === 'Issue') document.getElementById('bugDescription').placeholder = 'Describe The Issue....';
        document.getElementById('emailField').style.display = 'none';
    }
}
async function submitReport() {
    const description = document.getElementById('bugDescription').value.trim();
    if (!description) {
        alert("Make Sure All Fields Are Filled!");
        return;
    }
    const selectedButton = document.querySelector('.toggle-button.active');
    if (!selectedButton) {
        alert("Please Select A Button(report/contact/suggest) To Submit");
        return;
    }
    const type = selectedButton.innerText.trim();
    const user = document.cookie.split('; ').find(row => row.startsWith('un='))?.split('=')[1];
    const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    let reportData = {
        user: user,
        reason: description,
        time: time
    };
    if (type === 'Contact') {
        const email = document.getElementById('emailInput').value.trim();
        if (!email) {
            alert("Email Is Required For Contact!");
            return;
        }
        reportData.title = "Email";
        reportData.id = email;
    } else if (type === 'Suggest') {
        reportData.title = "Suggest";
        reportData.id = false;
    } else if (type === 'Issue') {
        reportData.title = "Report";
        reportData.id = false;
    }
    try {
        await fetch('/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData)
        });
        if(type==='Contact'){
            alert("Report Submitted Successfully! Wait Until We Contact You.");
        } else {
            alert("Report Submitted Successfully!");
        }
    } catch (error) {
        console.error(`Error submitting ${type}:`, error);
        alert(`Failed To Submit ${type}! Try Again Later.`);
    }
    closeModal();
}
async function getLimit(){
    const response = await fetch('/checkLimit');
    const data = await response.json();
    return data.limit;
}
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if(overlay){
        overlay.style.display = 'flex';
    }
}
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if(overlay){
        overlay.style.display = 'none';
    }
}
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if(parts.length === 2) return parts.pop().split(';').shift();
    return null;
}
if(!(getCookie("un") && getCookie("pass"))){
    window.location.href = '/';
}
document.querySelector('.logout-btn').addEventListener('click', function() {
    document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/");
    });
    window.location.href = '/';
});
async function fetchData(retryCount, type) {
    try {
        const response = await fetch(`/api?type=${type}`);
        updateTip();
        updateNotices();
        if(response.status === 429){
            hideLoading();
            fetchData(3, 'db');
            return alert("Today Limit Is Reached. You Can Fetch New Data Tomorrow After 3:00 A.M");
        }
        const datae = await response.json();
        const data = await datae.data;
        if(datae.success){
            document.getElementById('user-name').textContent = `${data.profile[0]["Student Name"]} (${data.profile[1]["Register No."]}) (${data.profile[3]["Semester"]})`;
            await updateClassStatus(data.timetable);
            await updateAttendanceData(data);
            await updateTimetableData(data);
            await updateSubjectsData(data);
            await updateSettings();
            await updateCode();
            hideLoading();
        } else {
            if(retryCount > 0){
                setTimeout(() => fetchData(retryCount - 1, 'website'), 1000);
            } else {
                document.getElementById('user-name').textContent = 'Logout And Try Agian With Proper Credentials.';
                hideLoading();
                alert("Please Check The Credentails Once. Enter Only Student Portal Credentials.");
            }
        }
    } catch (error) {
        hideLoading();
        console.error('Error fetching data:', error);
    }
}
document.querySelectorAll('.tab-link').forEach(button => {
    button.addEventListener('click', function () {
        document.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        this.classList.add('active');
        const tabName = this.getAttribute('data-tab');
        document.getElementById(tabName).classList.add('active');
        history.replaceState(null, null, `#${tabName}`);
    });
});
window.addEventListener("load", () => {
    let hash = window.location.hash.substring(1);
    if(hash){
        const tabButton = document.querySelector(`.tab-link[data-tab="${hash}"]`);
        const tabContent = document.getElementById(hash);
        if (tabButton && tabContent) {
            document.querySelectorAll(".tab-link").forEach(el => el.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
            tabButton.classList.add("active");
            tabContent.classList.add("active");
        }
    }
});
function activateTab(tabId){
    const tabButton = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
    const tabContent = document.getElementById(tabId);
    if (tabButton && tabContent) {
        document.querySelectorAll(".tab-link").forEach(el => el.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
        tabButton.classList.add("active");
        tabContent.classList.add("active");
        window.history.replaceState(null, null, `#${tabId}`);
    }
}
async function updateAttendanceData(data) {
    const attendanceSection = document.getElementById('attendance-section');
    attendanceSection.innerHTML = '';
    let adData = null;
    try {
        const response = await fetch('/ad');
        if (response.ok) {
            adData = await response.json();
        }
    } catch (error) {
        console.error("Error fetching ad.json:", error);
    }
    data.attendance.forEach((item, index) => {
        let totalClassesRequired = Math.ceil(item.absent / 0.25);
        let classesNeeded = totalClassesRequired - item.classes_conducted;
        classesNeeded = classesNeeded > 0 ? classesNeeded : 0;
        const percentage = parseFloat(item.attendance_percentage);
        const maxBunkable = Math.floor((0.25 * item.classes_conducted - item.absent) / 0.75);
        const row = document.createElement('div');
        row.classList.add('attendance-row');
        row.innerHTML = `
            <div class="attendance-card">
                <h2>${item.subject_name}</h2>
                <div class="progress-bar">
                    <div class="progress" style="width: ${percentage}%"></div>
                    <div class="threshold"></div>
                </div>
                <p><strong>Percentage: </strong><span class="attendance-percentage">${percentage.toFixed(2)}</span></p>
                <p><strong>Classes Conducted: </strong><span class="classes-conducted">${item.classes_conducted}</span></p>
                <p><strong>Present: </strong><span class="present">${item.present}</span></p>
                <p><strong>Absents: </strong><span class="absents">${item.absent}</span></p>
                <p>No. of Classes You Can Bunk: <span class="bunk-allowed">${maxBunkable >= 0 ? maxBunkable : 0}</span></p>
                <p>Classes Needed to Reach 75%: <span class="classes-needed">${classesNeeded}</span></p>
                <p>Bunks Needed: <button class="bunk-btn" onclick="updateAttendance(this, '${item.subject_code}')">Click Here</button></p>
                <button class="revert-btn" onclick="revertChanges(this)">Revert Changes</button>
            </div>`;
        
        attendanceSection.appendChild(row);
        if (index === 0 && adData && adData.title && adData.description) {
            let adText = adData.description.replace(/\((https?:\/\/[^\s]+)\)/g, '<a href="$1" target="_blank">$1</a>');
            const adCard = document.createElement('div');
            adCard.classList.add('ad-card');
            adCard.innerHTML = `
                <div class="ad-content">
                    <h6 style="color: red;">ADVERTISEMENT</h6>
                    <h2>${adData.title}</h2>
                    <p>${adText}</p>
                </div>`;
            
            attendanceSection.appendChild(adCard);
        }
    });
}
function updateTimetableData(data){
    const timetableSection = document.getElementById('timetable-section');
    timetableSection.innerHTML = ''; 
    const table = document.createElement('table');
    table.classList.add('timetable');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Day</th>
                <th>9:00-9:55</th>
                <th>10:00-10:55</th>
                <th>11:00-11:55</th>
                <th>12:00-12:55</th>
                <th>1:00-1:50</th>
                <th>2:00-2:55</th>
                <th>3:00-3:50</th>
                <th>4:00-5:30</th>
            </tr>
        </thead>
        <tbody>
            ${data.timetable.filter(day => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.day)).map(day => 
            `<tr>
                <td><strong>${day.day.substring(0, 3)}</strong></td>
                <td>${day.subjects[0] || ''}</td>
                <td>${day.subjects[1] || ''}</td>
                <td>${day.subjects[2] || ''}</td>
                <td>${day.subjects[3] || ''}</td>
                <td>${day.subjects[4] || ''}</td>
                <td>${day.subjects[5] || ''}</td>
                <td>${day.subjects[6] || ''}</td>
                <td>${day.subjects[7] || ''}</td>
            </tr>`).join('')}
        </tbody>`;
    timetableSection.appendChild(table);
}
function updateCode(){
    const settingsSection  = document.getElementById('attendance-code-section');
    settingsSection.innerHTML = `
        <div class="container">
            <h2>Enter the Correct Code:</h2>
            <div id="emoji" class="emoji">🙂</div>
            <input type="text" id="userInput" placeholder="Enter here"/>
            <button id="button-code">Send</button>
            <div id="message" class="message"></div>
            <p class="danger">Beta Version. Use At Your Own Risk!</p>
        </div>
    `;
    document.getElementById("button-code").addEventListener("click", async () => {
        const username = getCookie("un");
        const password = getCookie("pass");
        const code = document.getElementById("userInput").value;
        if (!username || !password || !code) {
            alert("Missing Parameters: code/username/password.");
            return;
        }
        const isValidLength = code.length === 7;
        const startsWithLetter = /^[A-Za-z]/.test(code);
        if (!isValidLength || !startsWithLetter) {
            emoji.classList.remove("happy");
            emoji.classList.add("sad");
            emoji.textContent = "🙁";
            alert("Problems May be: First Letter Should Be Alphabet/Code Should Be Only 7 Letters Long.");
            return;
        }
        try {
            showLoading();
            const response = await fetch("/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    un: username,
                    pass: password,
                    attendancecode: code
                })
            });
            let json = await response.json();
            if (json.success){
                hideLoading();
                alert("Code Captured!");
                emoji.classList.remove("sad");
                emoji.classList.add("happy");
                emoji.textContent = "😊";
            } else {
                hideLoading();
                alert(`${json.message}`);
                emoji.classList.remove("happy");
                emoji.classList.add("sad");
                emoji.textContent = "🙁";
            }
        } catch (error) {
            hideLoading();
            console.error("Error:", error);
            alert("An error occurred!");
            emoji.classList.remove("happy");
            emoji.classList.add("sad");
            emoji.textContent = "🙁";
        }
    });
}

function updateTip() {
    const noticeSection = document.getElementById('tip');
    noticeSection.innerHTML = '';
    fetch('/notice')
        .then(response => response.json())
        .then(notices => {
            if (notices.length > 0) {
                const truncatedMessage = notices[0].message.length > 40 ? notices[0].message.substring(0, 37) + '...' : notices[0].message;
                noticeSection.textContent = `Notice:- ${truncatedMessage}`;
                noticeSection.style.cursor = 'pointer';
            }
        })
        .catch(error => console.error('Error fetching notices:', error));
}
function updateNotices() {
    const noticeSection = document.getElementById('notice-section');
    noticeSection.innerHTML = '';
    fetch('/notice')
        .then(response => response.json())
        .then(notices => {
            notices.forEach(notice => {
                const noticeCard = document.createElement('div');
                let noticeData = notice.message.replace(/\((https?:\/\/[^\s]+)\)/g, '<a href="$1" target="_blank">$1</a>');
                noticeCard.innerHTML = `
                    <div class="notice-card">
                        <p><strong>Notice: </strong><span class="notice">${noticeData}</span></p>
                    </div>
                `;
                noticeSection.appendChild(noticeCard);
            });
        })
        .catch(error => console.error('Error fetching notices:', error));
}
function updateSubjectsData(data){
    const subjectsTable = document.getElementById("subjects-section");
    const [program, section] = data.profile[4]["Program / Section"].split('/').map(item => item.trim());
    const [dob, gender] = data.profile[6]["D.O.B. / Gender"].split('/').map(item => item.trim());
    subjectsTable.innerHTML = `
        <div class="subject-card">
            <h2>${data.profile[0]["Student Name"]} (${data.profile[1]["Register No."]})</h2>
            <p><strong>Institution: </strong>${data.profile[2]["Institution"]}</p>
            <p><strong>Semester: </strong>${data.profile[3]["Semester"]}</p>
            <p><strong>Program: </strong>${program}</p>
            <p><strong>Section: </strong>${section}</p>
            <p><strong>D.O.B: </strong>${dob}</p>
            <p><strong>Gender: </strong>${gender}</p>
        </div>`;
    data.subjects.forEach(item => {
        const row = `
            <div class="subject-card">
                <h2>${item.name}</h2>
                <p><strong>Code: </strong>${item.code}</p>
                <p><strong>Faculty: </strong>${item.faculty}</p>
                <p><strong>Credits: </strong>${item.credit}</p>
                <p><strong>Semester: </strong>${item.semester}</p>
            </div>`;
        subjectsTable.innerHTML += row;
    });
}
function updateAttendance(element, subjectCode){
    let userValue = parseInt(prompt("Enter No.of Classes You Want To Bunk:- "));
    if(isNaN(userValue) || userValue < 0){
        alert("Please enter a valid number.");
        return;
    }
    let parent = element.closest('.attendance-card');
    let classesConductedElem = parent.querySelector(".classes-conducted");
    let absentsElem = parent.querySelector(".absents");
    let percentageElem = parent.querySelector(".attendance-percentage");
    let bunkAllowedElem = parent.querySelector(".bunk-allowed");
    let classesNeededElem = parent.querySelector(".classes-needed");
    let progressElem = parent.querySelector(".progress");
    let revertBtn = parent.querySelector(".revert-btn");
    if (!revertBtn.dataset.original) {
        revertBtn.dataset.original = JSON.stringify({
            classesConducted: classesConductedElem.textContent,
            absents: absentsElem.textContent,
            percentage: percentageElem.textContent,
            bunkAllowed: bunkAllowedElem.textContent,
            classesNeeded: classesNeededElem.textContent
        });
    }
    let classesConducted = parseInt(classesConductedElem.textContent) + userValue;
    let absents = parseInt(absentsElem.textContent) + userValue;
    let attendancePercentage = ((classesConducted - absents) / classesConducted) * 100;
    let maxBunkable = Math.floor((0.25 * classesConducted - absents) / 0.75);
    maxBunkable = maxBunkable >= 0 ? maxBunkable : 0;
    let totalClassesRequired = Math.ceil(absents / 0.25);
    let classesNeeded = totalClassesRequired - classesConducted;
    classesNeeded = classesNeeded > 0 ? classesNeeded : 0;
    classesConductedElem.textContent = classesConducted;
    absentsElem.textContent = absents;
    percentageElem.textContent = attendancePercentage.toFixed(2);
    progressElem.style.width = `${attendancePercentage}%`;
    bunkAllowedElem.textContent = maxBunkable;
    classesNeededElem.textContent = classesNeeded;
    revertBtn.style.display = "block";
}
function revertChanges(button) {
    let parent = button.parentElement;
    let classesConductedElem = parent.querySelector(".classes-conducted");
    let absentsElem = parent.querySelector(".absents");
    let percentageElem = parent.querySelector(".attendance-percentage");
    let bunkAllowedElem = parent.querySelector(".bunk-allowed");
    let classesNeededElem = parent.querySelector(".classes-needed");
    let progressElem = parent.querySelector(".progress");
    let originalData = JSON.parse(button.dataset.original);
    classesConductedElem.textContent = originalData.classesConducted;
    absentsElem.textContent = originalData.absents;
    percentageElem.textContent = originalData.percentage;
    bunkAllowedElem.textContent = originalData.bunkAllowed;
    classesNeededElem.textContent = originalData.classesNeeded;
    progressElem.style.width = `${originalData.percentage}%`;
    let revertBtn = parent.querySelector(".revert-btn");
    revertBtn.style.display = "none";
}
function getCurrentTime() {
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const date = new Date(now);
    time = date.getHours() * 60 + date.getMinutes();
    return time
;}
function updateClassStatus(timetable) {
    const currentTime = getCurrentTime();
    const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });
    let today = timetable.find(day => day.day === currentDay);
    if (!today || !Array.isArray(today.subjects)) return;
    const classSlots = [
        { start: 9 * 60, end: 9 * 60 + 55 },
        { start: 10 * 60, end: 10 * 60 + 55 },
        { start: 11 * 60, end: 11 * 60 + 55 },
        { start: 12 * 60, end: 12 * 60 + 55 },
        { start: 13 * 60, end: 13 * 60 + 50 },
        { start: 14 * 60, end: 14 * 60 + 55 },
        { start: 15 * 60, end: 15 * 60 + 50 },
        { start: 16 * 60, end: 16 * 60 + 90 }
    ];
    let ongoingClass = null;
    let upcomingClass = null;
    today.subjects.forEach((subject, index) => {
        if (!subject || subject.trim() === "") return;
        let { start, end } = classSlots[index];
        if (currentTime >= start && currentTime < end) {
            ongoingClass = { subject, time: formatTime(start) + " - " + formatTime(end) };
        } else if (currentTime < start && !upcomingClass) {
            upcomingClass = { subject, time: formatTime(start) + " - " + formatTime(end) };
        }
    });
    const ongoingContainer = document.getElementById('current-classes');
    ongoingContainer.innerHTML = '';
    if(ongoingClass){
        ongoingContainer.innerHTML += `
            <div class="class-card ongoing">
                <span class="class-status status-ongoing">ONGOING</span>
                <h3>${ongoingClass.subject}</h3>
                <p><strong>Time:</strong> ${ongoingClass.time}</p>
             </div>
        `;
    }
    if(upcomingClass){
    ongoingContainer.innerHTML += `
        <div class="class-card upcoming">
            <span class="class-status status-upcoming">UPCOMING</span>
            <h3>${upcomingClass.subject}</h3>
            <p><strong>Time:</strong> ${upcomingClass.time}</p>
        </div>`;
    }
}
function closeModal() {
    const reportModal = document.getElementById('reportModal');
    reportModal.style.display = 'none';
    overlay.style.display = 'none';
}
async function updateSettings(){
    const settingsSection  = document.getElementById('settings');
    settingsSection.innerHTML = `
        <h2>Settings</h2>
        <button id="fetch-btn" class="fetch-btn">Fetch New Data</button>
        <br/>
        <button id="delete-data" class="fetch-btn">Delete My Data</button>
        <br/>
        <button id="report" class="fetch-btn">Report/Suggest/Contact</button>
        <br/>
        <h5>Fetch New Data Limit:- ${await getLimit()}</h5>
        <h6>Note:- New Data Is Updated In The Student Portal Between 12:00 AM And 3:00 AM. The Fetch Data Button May Not Effective, As Our System Automatically Retrieves The Latest Data After 3:00 AM.</h6>
    `;
    document.getElementById("fetch-btn").addEventListener('click', async () => {
        try {
            showLoading();
            activateTab("attendance-details");
            await fetchData(3, 'website');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to fetch data.');
        }
    });
    const reportBtn = document.getElementById('report');
    reportBtn.addEventListener('click', () => {
        reportModal.style.display = 'flex';
        overlay.style.display = 'flex';
    });
    document.getElementById("delete-data").addEventListener("click", async () => {
        const username = getCookie("un");
        const password = getCookie("pass");
        if (!username || !password) {
            alert("Missing username or password");
            return;
        }
        try {
            const response = await fetch("/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    un: username,
                    pass: password
                })
            });
            const result = await response.json();
            if (response.ok) {
                alert("Data deleted successfully");
                document.cookie.split(";").forEach(cookie => {
                    document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/");
                });
                window.location.href = '/';
            } else {
                alert(result.message || "Failed to delete data");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting data");
        }
    });
}

function formatTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
}
fetchData(3, 'db');