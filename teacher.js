// LOGIN
function loginTeacher() {
  const name = document.getElementById("tname").value;

  if (!name) {
    alert("Enter name");
    return;
  }

  alert("Welcome Teacher " + name);
  loadStudents();
}

// ADD QUESTION
function addQuestion() {
  const q = document.getElementById("question").value;
  const o1 = document.getElementById("opt1").value;
  const o2 = document.getElementById("opt2").value;
  const o3 = document.getElementById("opt3").value;
  const correct = parseInt(document.getElementById("correct").value);
  const subject = document.getElementById("subject").value;

  let newQ = {
    text: q,
    options: [o1, o2, o3],
    correct: correct
  };

  let stored = JSON.parse(localStorage.getItem(subject)) || [];
  stored.push(newQ);

  localStorage.setItem(subject, JSON.stringify(stored));

  alert("Question Added!");
}

// LOAD STUDENTS
function loadStudents() {
  const list = document.getElementById("students");
  list.innerHTML = "";

  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);

    if (key.endsWith("_score")) {
      let name = key.replace("_score", "");
      let score = localStorage.getItem(key);

      let li = document.createElement("li");
      li.innerText = name + " - Score: " + score;

      list.appendChild(li);
    }
  }
}