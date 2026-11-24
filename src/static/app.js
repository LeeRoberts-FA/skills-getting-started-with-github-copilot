document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  let messageTimer;

  function showMessage(message, success) {
    clearTimeout(messageTimer);
    messageDiv.textContent = message;
    messageDiv.className = success ? "message success" : "message error";
    messageDiv.setAttribute("role", "status");
    messageTimer = setTimeout(() => messageDiv.classList.add("hidden"), 5000);
  }

  function paragraph(text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }

  async function fetchActivities() {
    const selected = activitySelect.value;
    try {
      const response = await fetch("/activities");
      if (!response.ok) throw new Error("Could not load activities");
      const activities = await response.json();
      activitiesList.replaceChildren();
      activitySelect.replaceChildren(new Option("-- Select an activity --", ""));
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";
        const title = document.createElement("h4");
        title.textContent = name;
        activityCard.append(title, paragraph(details.description),
          paragraph("Schedule: " + details.schedule),
          paragraph("Availability: " + (details.max_participants - details.participants.length) + " spots left"));

        const section = document.createElement("div");
        section.className = "participants-section";
        const heading = document.createElement("h5");
        heading.textContent = "Participants (" + details.participants.length + ")";
        section.appendChild(heading);
        if (!details.participants.length) {
          const empty = paragraph("No participants yet.");
          empty.className = "participants-empty";
          section.appendChild(empty);
        } else {
          const list = document.createElement("ul");
          list.className = "participants-list";
          details.participants.forEach(email => {
            const row = document.createElement("li");
            row.className = "participant-row";
            const label = document.createElement("span");
            label.className = "participant-email";
            label.textContent = email;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "unregister-button";
            button.textContent = "×";
            button.setAttribute("aria-label", "Unregister " + email + " from " + name);
            button.addEventListener("click", async () => {
              button.disabled = true;
              try {
                const result = await fetch("/activities/" + encodeURIComponent(name) +
                  "/unregister?email=" + encodeURIComponent(email), {method: "DELETE"});
                const data = await result.json();
                if (!result.ok) throw new Error(data.detail || "Unable to unregister");
                showMessage(data.message, true);
                await fetchActivities();
              } catch (error) {
                showMessage(error.message, false);
              } finally {
                button.disabled = false;
              }
            });
            row.append(label, button);
            list.appendChild(row);
          });
          section.appendChild(list);
        }
        activityCard.appendChild(section);
        activitiesList.appendChild(activityCard);
        activitySelect.add(new Option(name, name));
      });
      if (Object.hasOwn(activities, selected)) activitySelect.value = selected;
    } catch (error) {
      activitiesList.replaceChildren(paragraph("Failed to load activities. Please try again."));
      console.error(error);
    }
  }

  signupForm.addEventListener("submit", async event => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const activity = activitySelect.value;
    const submit = signupForm.querySelector("button[type=submit]");
    submit.disabled = true;
    try {
      const response = await fetch("/activities/" + encodeURIComponent(activity) +
        "/signup?email=" + encodeURIComponent(email), {method: "POST"});
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Unable to sign up");
      signupForm.reset();
      showMessage(result.message, true);
      await fetchActivities();
    } catch (error) {
      showMessage(error.message, false);
    } finally {
      submit.disabled = false;
    }
  });

  fetchActivities();
});
