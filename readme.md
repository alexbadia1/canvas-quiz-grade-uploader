# Canvas Quiz Auto Grader

![Demo GIF Redacted for FERPA Restrictions](/)

<!-- ![alt text](image.png) -->

## Overview

This plugin enables you to upload JSON files for each midterm question. 

Once you are finished uploading some JSON files, click the `Auto Upload` button and let the plugin do the rest of the work for you.

## Setup

To use a React Application as a chrome extension, you need to `npm run build` the application and then point to the `build` directory when you load the extension in Chrome.

## Usage

**_First_**, make sure you are on the speedgrader page for the midterm:

![alt text](/docs/speedgrader.png)

**_Second_**, the JSON file for each question must be in the following format:

```json
// Format
{
    "canvasQuestionId": "<number as a string>",
    "grades": {
        ...
        "<canvas student id>": {
            "points": "<number as a string>",
            "comments": "<raw multi-line string>"
        },
        ...
    }
}

// Example
{
    "canvasQuestionId": "5177502",
    "grades": {
        ...
        "420420": {
            "points": "42",
            "comments": "The answer to life, the universe, and everything \n another line of comments"
        },
        ...
    }
}
```

Note that **all** values must be __*strings*__:
  - `canvasQuestionId` must be a string
  - `<canvas student id>` must be a string
  - `points` must be a string representing a number
  - `comments` must be a string
    - Don't worry, Canvas will render string escaped characters correctly

**_Third_**, if you are done uploading JSON files for all your desiredquestions, click the `Auto Upload` button and let the plugin do the rest of the work for you.
  - Behind the scenes, the plugin will merge all of your JSON files into a single JSON file and then upload the single file to Canvas, for example:

  ```json
  {
    "420420": { // canvasStudentId
      "5177502": { // canvasQuestionId
        "points": "42",
        "comments": "The answer to life, the universe, and everything"
      } 
    },
    "696969": { // canvasStudentId
      "5177502": { // canvasQuestionId
        "points": "69",
        "comments": "The answer to life, the universe, and everything"
      }
    }
  }
  ```

## Behavior
  - The plugin will skip grading missing students and missing questions.
    - If you don't want to manually grade these outliers, adjust your autograde skips to include outlier submissions and the appropriate score per question.
  - The plugin **_will_** overwrite existing grades.
  - Due to Canvas limitations, the plugin takes about 25 minutes to upload grades for 230 students. It's not the fastest thing in the world, but at least it's not manual.

## FAQ

- **Q:** Where do I find the Canvas Question ID?
  - Inspect the question elements on the speedgrader page and check the `data-question-id` attribute on the input fields:

    ![alt text](/docs/canvas_question_id.png)

- **Q:** Is there a way to map the student submissions to Canvas Student ID's, Canvas Question ID's, etc?
  - For file submissions, the structure is as follows:

    ```txt
    <name>_<name>_<name><Canvas Student ID>_question_<canvas Question Id>_<maybe a timestamp>.<file extension>
    ```
  - For Canvas Responses, they are exportable from the `Statistics` tab by clicking on the `Student Analysis` button.

## Future Features
  1. Show progress during auto upload
    - This will require syncronozing state between the browser and chrome plugin as they technically run as isolated processes.
  2. Allow user to directly upload the merged JSON files

Lot's more cool features to come!
