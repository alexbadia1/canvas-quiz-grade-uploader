function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function set_q3_comments(iframe_document, comments) {
  const textarea_element = iframe_document.getElementById(
    'question_comment_5177500'
  );
  if (textarea_element) {
    textarea_element.value = comments;
  }
}

function set_q3_grade(iframe_document, grade) {
  const question_score_visible_input_field = iframe_document.getElementById(
    'question_score_5177500_visible'
  );
  if (question_score_visible_input_field) {
    question_score_visible_input_field.value = grade;
  }
  const question_input_hidden_input_field = iframe_document.querySelector(
    'input.question_input_hidden[name="question_score_5177500"]'
  );
  if (question_input_hidden_input_field) {
    question_input_hidden_input_field.value = grade;
  }
}

function update_scores(iframe_document) {
  const update_scores_button = iframe_document.querySelector(
    'button.btn.btn-primary.update-scores'
  );
  if (update_scores_button) {
    update_scores_button.click();
  }
}

function grade_student(full_name, canvas_id, grade, comments) {
  const options = Array.from(document.querySelectorAll('option'));
  const option = options.find((opt) => opt.value === canvas_id);

  if (option) {
    option.selected = true;
    option.closest('select').dispatchEvent(new Event('change'));
  } else {
    alert(
      `Failed to show ${full_name} because Canvas ID ${canvas_id} not found!`
    );
  }

  const iframe = document.getElementById('speedgrader_iframe');
  let iframeLoaded = false;
  iframe.onload = () => {
    if (!iframeLoaded) {
      iframeLoaded = true;
      const iframe_document =
        iframe.contentDocument || iframe.contentWindow.document;
      set_q3_grade(iframe_document, grade);
      set_q3_comments(iframe_document, comments);
      update_scores(iframe_document);
    }
  };
}

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.action == 'grade_student') {
    const { full_name, canvas_id, grade, comments } = request.payload;
    grade_student(full_name, canvas_id, grade, comments);
  } else if (request.action == 'grade_students') {
    const students = request.payload;
    for (const k in students) {
      const { full_name, canvas_id, grade, comments } = students[k];
      grade_student(full_name, canvas_id, grade, comments);
      await sleep(5_000);
    }
  }
});
