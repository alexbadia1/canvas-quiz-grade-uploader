/* Here's where the magic happens, life without frameworks is painful */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function find_student_by_cavnas_id(canvas_id) {
  const nodes = document.querySelectorAll('option');

  if (nodes.length === 0) {
    console.error(`[find_student_by_cavnas_id] No students found in dropdown for student with Canvas ID: ${canvas_id}`);
    return False;
  }

  const options = Array.from(nodes);
  const option = options.find((opt) => opt.value === String(canvas_id));

  if (option) {
    option.selected = true;
    option.closest('select').dispatchEvent(new Event('change'));
    return True;
  }

  console.error(`Failed to find student with Canvas ID ${canvas_id}!`);
  return False;
}

function set_question_score(iframe_document, score, html_field_id) {
  const question_score_visible_input_field = iframe_document.getElementById(
    `question_score_${html_field_id}_visible`
  );
  if (question_score_visible_input_field) {
    question_score_visible_input_field.value = score;
  } else {
    console.error(`[set_question_score] question_score_${html_field_id}_visible not found!`);
  }

  const question_input_hidden_input_field = iframe_document.querySelector(
    `input.question_input_hidden[name="question_score_${html_field_id}"]`
  );
  if (question_input_hidden_input_field) {
    question_input_hidden_input_field.value = score;
  } else {
    console.error(`[set_question_score] question_score_${html_field_id}_hidden not found!`);
  }
}

function set_question_comments(iframe_document, comments, html_field_id) {
  const textarea_element = iframe_document.getElementById(`question_comment_${html_field_id}`);
  if (textarea_element) {
    textarea_element.value = comments;
  } else {
    console.error(`[set_question_comments] question_comment_${html_field_id} not found!`);
  }
}

function submit_scores(iframe_document) {
  const update_scores_button = iframe_document.querySelector(
    'button.btn.btn-primary.update-scores'
  );
  if (update_scores_button) {
    update_scores_button.click();
  } else {
    console.error(`[submit_scores] update-scores button not found!`);
  }
}

/**
 * Uploads grades for a single student
 * 
 * @param {string} student_canvas_id - The Canvas ID of the student 
 * @param {Object} obj - The gradebook for a single student
 *   obj = {
 *     "5177502": { // canvasQuestionId
 *       score: 5,
 *       comments: "Good attempt, but needs improvement"
 *     },
 *     "5177506": {  // canvasQuestionId
 *       score: 10,
 *       comments: "Perfect!"
 *     },
 *     "5177507": {  // canvasQuestionId
 *       score: 8,
 *       comments: "Well done"
 *     },
 *   };
 */
async function grade_student(student_canvas_id, obj) {
  // 1. Select the student by canvas_id from dropdown
  if (!find_student_by_cavnas_id(student_canvas_id)) {
    console.error(`[grade_student] Skipping student with Canvas ID: ${student_canvas_id}`);
    return;
  }

  // 2. Grading form is actually in an iframe
  const iframe = document.getElementById('speedgrader_iframe');

  if (!iframe) {
    console.error(`[grade_student(${student_canvas_id})] speedgrader_iframe not found!`);
    return;
  }

  let iframeLoaded = false;

  // 3. Set the score and comments once the iframe is loaded
  iframe.onload = () => {
    if (!iframeLoaded) {
      // Only set on first load, to prevent infinite loop of submitting scores
      iframeLoaded = true;

      // Elements are accessible because iframe is from the same origin
      //   Credit: Adam Bate's CS461 Security Lecture on Web Security
      const ifd = iframe.contentDocument || iframe.contentWindow.document;

      if (!ifd) {
        console.error(`[grade_student(${student_canvas_id})] speedgrader_iframe contentDocument not found!`);
        return;
      }

      // Programmtically filling in input fields (found by inspecting the DOM)
      //   ...
      //   Question 5a = 5177502
      //   Question 5b = 5177506
      //   Question 5c = 5177507
      //   Question 6a = 5177503
      //   Question 6b = 5177508
      //   Question 6c = 5177509
      //   ...
      for (const canvas_question_id in obj) {
        set_question_score(ifd, obj[canvas_question_id].score, question_id);
        set_question_comments(ifd, obj[canvas_question_id].comments, question_id);
      }

      // Programmatically hitting the "Update" button
      submit_scores(ifd);
    }
  };
}

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.action === 'auto-upload') {
    let count = 0;
    for (const student_canvas_id in request.payload) {
      grade_student(student_canvas_id, request.payload[student_canvas_id]);
      await sleep(6900); // Unfortunatley, Canvas requires a delay between submissions
      count++;
    }
    alert(`Chrome Plugin Finished: ${request.action}: ${count} students graded`);
  }
  sendResponse({ status: "Chrome Plugin Finished: " + request.action });
});
