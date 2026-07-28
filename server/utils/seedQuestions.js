const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");
const Question = require("../models/Question");

dotenv.config({ path: __dirname + "/../.env" });
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const questions = [
  // ===== QUANTITATIVE =====
  {
    category: "quantitative",
    question: "If the cost price of 20 articles is equal to the selling price of 16 articles, what is the profit percentage?",
    options: ["20%", "25%", "30%", "33.33%"],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "CP of 20 = SP of 16. Let CP = 1 each. SP of 16 = 20, SP of 1 = 20/16 = 1.25. Profit = 25%.",
  },
  {
    category: "quantitative",
    question: "A train 150m long passes a pole in 15 seconds. What is its speed in km/hr?",
    options: ["36 km/hr", "32 km/hr", "40 km/hr", "28 km/hr"],
    correctAnswer: 0,
    difficulty: "easy",
    explanation: "Speed = 150/15 = 10 m/s = 10 × 18/5 = 36 km/hr.",
  },
  {
    category: "quantitative",
    question: "Two pipes can fill a tank in 12 and 15 hours respectively. If both are opened together, how long to fill the tank?",
    options: ["6 hr 40 min", "6 hr", "7 hr", "5 hr 30 min"],
    correctAnswer: 0,
    difficulty: "medium",
    explanation: "Combined rate = 1/12 + 1/15 = 9/60 = 3/20. Time = 20/3 = 6 hr 40 min.",
  },
  {
    category: "quantitative",
    question: "What is the compound interest on ₹10,000 at 10% per annum for 2 years?",
    options: ["₹2,000", "₹2,100", "₹2,200", "₹1,900"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "CI = 10000[(1+0.1)² - 1] = 10000[1.21 - 1] = 10000 × 0.21 = ₹2,100.",
  },
  {
    category: "quantitative",
    question: "The average of 5 consecutive odd numbers is 27. What is the largest number?",
    options: ["29", "31", "33", "35"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "Middle number = 27. Five consecutive odd: 23, 25, 27, 29, 31. Largest = 31.",
  },
  {
    category: "quantitative",
    question: "A mixture of 40 litres has milk and water in the ratio 3:1. How much water must be added to make the ratio 2:1?",
    options: ["5 litres", "6 litres", "8 litres", "10 litres"],
    correctAnswer: 0,
    difficulty: "hard",
    explanation: "Milk = 30L, Water = 10L. For 2:1 ratio: 30/(10+x) = 2/1 → x = 5L.",
  },
  {
    category: "quantitative",
    question: "If 6 workers can complete a job in 8 days, how many days will 4 workers take?",
    options: ["10 days", "12 days", "14 days", "16 days"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "Total work = 6 × 8 = 48 man-days. Time for 4 workers = 48/4 = 12 days.",
  },
  {
    category: "quantitative",
    question: "What is 35% of 240 + 65% of 160?",
    options: ["188", "176", "192", "204"],
    correctAnswer: 0,
    difficulty: "easy",
    explanation: "35% of 240 = 84. 65% of 160 = 104. Total = 84 + 104 = 188.",
  },
  {
    category: "quantitative",
    question: "The HCF and LCM of two numbers are 12 and 360 respectively. If one number is 60, find the other.",
    options: ["72", "48", "84", "96"],
    correctAnswer: 0,
    difficulty: "medium",
    explanation: "HCF × LCM = Product of numbers. 12 × 360 = 60 × x → x = 72.",
  },
  {
    category: "quantitative",
    question: "A car covers 432 km in 6 hours. What is the speed in m/s?",
    options: ["20 m/s", "18 m/s", "22 m/s", "24 m/s"],
    correctAnswer: 0,
    difficulty: "easy",
    explanation: "Speed = 432/6 = 72 km/hr = 72 × 5/18 = 20 m/s.",
  },

  // ===== LOGICAL REASONING =====
  {
    category: "logical",
    question: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "Differences: 4, 6, 8, 10, 12. Next = 30 + 12 = 42.",
  },
  {
    category: "logical",
    question: "If COMPUTER is coded as DPNQVUFS, how is KEYBOARD coded?",
    options: ["LFZCPBSE", "LFZCPBRD", "LFZBPBSE", "KFZCPBSE"],
    correctAnswer: 0,
    difficulty: "medium",
    explanation: "Each letter shifted by +1: K→L, E→F, Y→Z, B→C, O→P, A→B, R→S, D→E.",
  },
  {
    category: "logical",
    question: "In a certain code, 'GREAT' is written as 'HSFBU'. How is 'POWER' written?",
    options: ["QPXFS", "QPWFS", "RPXFS", "QPXFT"],
    correctAnswer: 0,
    difficulty: "easy",
    explanation: "Each letter +1: P→Q, O→P, W→X, E→F, R→S.",
  },
  {
    category: "logical",
    question: "A is the father of B. C is the daughter of B. D is the brother of B. What is A to C?",
    options: ["Father", "Grandfather", "Uncle", "Brother"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "A is B's father. C is B's daughter. So A is C's grandfather.",
  },
  {
    category: "logical",
    question: "If all Bloops are Razzies and some Razzies are Lazzies, which statement must be true?",
    options: [
      "All Bloops are Lazzies",
      "Some Bloops may be Lazzies",
      "No Bloops are Lazzies",
      "All Lazzies are Bloops",
    ],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "Since some Razzies are Lazzies and all Bloops are Razzies, some Bloops may also be Lazzies.",
  },
  {
    category: "logical",
    question: "Looking at a portrait, Arun said, 'He is the son of my grandfather's only son.' Who is in the portrait?",
    options: ["Arun himself", "Arun's father", "Arun's son", "Arun's brother"],
    correctAnswer: 3,
    difficulty: "hard",
    explanation: "Grandfather's only son = Arun's father. Son of Arun's father = Arun or his brother. Since he said 'He', it's his brother.",
  },
  {
    category: "logical",
    question: "Complete the analogy: Book : Pages :: Tree : ?",
    options: ["Branches", "Leaves", "Roots", "Forest"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "A book is made up of pages, a tree is made up of leaves.",
  },
  {
    category: "logical",
    question: "Which figure comes next in the pattern: △, □, ○, △, □, ?",
    options: ["△", "□", "○", "◇"],
    correctAnswer: 2,
    difficulty: "easy",
    explanation: "The pattern repeats every 3: △, □, ○. Next is ○.",
  },
  {
    category: "logical",
    question: "If 1st January 2023 is a Sunday, what day is 1st March 2023?",
    options: ["Tuesday", "Wednesday", "Thursday", "Friday"],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "Jan has 31 days (4 weeks + 3 days). Feb 2023 has 28 days (4 weeks). Sun + 3 = Wed.",
  },
  {
    category: "logical",
    question: "Statement: All pens are chairs. All chairs are tables. Conclusion: All pens are tables.",
    options: ["True", "False", "Cannot be determined", "Partially true"],
    correctAnswer: 0,
    difficulty: "medium",
    explanation: "If all pens are chairs and all chairs are tables, then all pens are tables (transitive).",
  },

  // ===== TECHNICAL =====
  {
    category: "technical",
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "Binary search halves the search space each iteration, giving O(log n).",
  },
  {
    category: "technical",
    question: "Which data structure uses FIFO (First In First Out)?",
    options: ["Stack", "Queue", "Tree", "Graph"],
    correctAnswer: 1,
    difficulty: "easy",
    explanation: "Queue follows FIFO — elements are removed in the order they were added.",
  },
  {
    category: "technical",
    question: "What does SQL stand for?",
    options: [
      "Structured Query Language",
      "Simple Query Language",
      "Standard Query Logic",
      "Sequential Query Language",
    ],
    correctAnswer: 0,
    difficulty: "easy",
    explanation: "SQL stands for Structured Query Language.",
  },
  {
    category: "technical",
    question: "In OOP, which principle allows a subclass to provide a specific implementation of a method already defined in its superclass?",
    options: ["Encapsulation", "Abstraction", "Polymorphism", "Inheritance"],
    correctAnswer: 2,
    difficulty: "medium",
    explanation: "Method overriding is a form of runtime polymorphism.",
  },
  {
    category: "technical",
    question: "Which of the following is NOT a valid HTTP method?",
    options: ["GET", "POST", "FETCH", "DELETE"],
    correctAnswer: 2,
    difficulty: "easy",
    explanation: "FETCH is not a standard HTTP method. The standard methods include GET, POST, PUT, DELETE, PATCH, etc.",
  },
  {
    category: "technical",
    question: "What is the worst-case time complexity of quicksort?",
    options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "When the pivot is always the smallest/largest element, quicksort degrades to O(n²).",
  },
  {
    category: "technical",
    question: "Which normal form eliminates transitive dependencies in database design?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctAnswer: 2,
    difficulty: "medium",
    explanation: "Third Normal Form (3NF) eliminates transitive functional dependencies.",
  },
  {
    category: "technical",
    question: "In operating systems, what is a deadlock?",
    options: [
      "A situation where a process runs infinitely",
      "A situation where two or more processes are blocked forever, each waiting on the other",
      "A scheduling algorithm failure",
      "A memory leak condition",
    ],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "Deadlock occurs when processes hold resources and wait for resources held by others, creating a circular wait.",
  },
  {
    category: "technical",
    question: "What is the output of: console.log(typeof NaN)?",
    options: ["'NaN'", "'undefined'", "'number'", "'object'"],
    correctAnswer: 2,
    difficulty: "medium",
    explanation: "In JavaScript, typeof NaN returns 'number' — NaN is technically a numeric value.",
  },
  {
    category: "technical",
    question: "Which protocol operates at the transport layer of the OSI model?",
    options: ["HTTP", "TCP", "IP", "Ethernet"],
    correctAnswer: 1,
    difficulty: "medium",
    explanation: "TCP (Transmission Control Protocol) operates at Layer 4 (Transport Layer).",
  }, {"category": "quantitative", "question": "What is the value of 15% of 100 + 50?", "options": ["65", "75", "60", "70"], "correctAnswer": 0, "difficulty": "easy", "explanation": "15% of 100 is 15. Added to 50, the total is 65."},
{"category": "quantitative", "question": "What is the value of 15% of 200 + 100?", "options": ["130", "150", "120", "140"], "correctAnswer": 0, "difficulty": "hard", "explanation": "15% of 200 is 30. Added to 100, the total is 130."},
{"category": "quantitative", "question": "What is the value of 15% of 300 + 150?", "options": ["195", "225", "180", "210"], "correctAnswer": 0, "difficulty": "easy", "explanation": "15% of 300 is 45. Added to 150, the total is 195."},
{"category": "quantitative", "question": "What is the value of 15% of 400 + 200?", "options": ["260", "300", "240", "280"], "correctAnswer": 0, "difficulty": "medium", "explanation": "15% of 400 is 60. Added to 200, the total is 260."},
{"category": "quantitative", "question": "What is the value of 15% of 500 + 250?", "options": ["325", "375", "300", "350"], "correctAnswer": 0, "difficulty": "medium", "explanation": "15% of 500 is 75. Added to 250, the total is 325."},
{"category": "quantitative", "question": "What is the value of 15% of 600 + 300?", "options": ["390", "450", "360", "420"], "correctAnswer": 0, "difficulty": "medium", "explanation": "15% of 600 is 90. Added to 300, the total is 390."},
{"category": "quantitative", "question": "What is the value of 15% of 700 + 350?", "options": ["455", "525", "420", "490"], "correctAnswer": 0, "difficulty": "easy", "explanation": "15% of 700 is 105. Added to 350, the total is 455."},
{"category": "quantitative", "question": "What is the value of 15% of 800 + 400?", "options": ["520", "600", "480", "560"], "correctAnswer": 0, "difficulty": "hard", "explanation": "15% of 800 is 120. Added to 400, the total is 520."},
{"category": "quantitative", "question": "What is the value of 15% of 900 + 450?", "options": ["585", "675", "540", "630"], "correctAnswer": 0, "difficulty": "medium", "explanation": "15% of 900 is 135. Added to 450, the total is 585."},
{"category": "quantitative", "question": "What is the value of 15% of 1000 + 500?", "options": ["650", "750", "600", "700"], "correctAnswer": 0, "difficulty": "easy", "explanation": "15% of 1000 is 150. Added to 500, the total is 650."},
{"category": "quantitative", "question": "What is the value of 15% of 1100 + 550?", "options": ["715", "825", "660", "770"], "correctAnswer": 0, "difficulty": "medium", "explanation": "15% of 1100 is 165. Added to 550, the total is 715."},
{"category": "quantitative", "question": "What is the value of 15% of 1200 + 600?", "options": ["780", "900", "720", "840"], "correctAnswer": 0, "difficulty": "medium", "explanation": "15% of 1200 is 180. Added to 600, the total is 780."},
{"category": "quantitative", "question": "What is the value of 15% of 1300 + 650?", "options": ["845", "975", "780", "910"], "correctAnswer": 0, "difficulty": "hard", "explanation": "15% of 1300 is 195. Added to 650, the total is 845."},
{"category": "quantitative", "question": "What is the value of 15% of 1400 + 700?", "options": ["910", "1050", "840", "980"], "correctAnswer": 0, "difficulty": "easy", "explanation": "15% of 1400 is 210. Added to 700, the total is 910."},
{"category": "quantitative", "question": "What is the value of 15% of 1500 + 750?", "options": ["975", "1125", "900", "1050"], "correctAnswer": 0, "difficulty": "easy", "explanation": "15% of 1500 is 225. Added to 750, the total is 975."},
{"category": "quantitative", "question": "What is the value of 15% of 1600 + 800?", "options": ["1040", "1200", "960", "1120"], "correctAnswer": 0, "difficulty": "easy", "explanation": "15% of 1600 is 240. Added to 800, the total is 1040."},
{"category": "quantitative", "question": "What is the value of 15% of 1700 + 850?", "options": ["1105", "1275", "1020", "1190"], "correctAnswer": 0, "difficulty": "hard", "explanation": "15% of 1700 is 255. Added to 850, the total is 1105."},
{"category": "quantitative", "question": "What is the value of 15% of 1800 + 900?", "options": ["1170", "1350", "1080", "1260"], "correctAnswer": 0, "difficulty": "medium", "explanation": "15% of 1800 is 270. Added to 900, the total is 1170."},
{"category": "quantitative", "question": "What is the value of 15% of 1900 + 950?", "options": ["1235", "1425", "1140", "1330"], "correctAnswer": 0, "difficulty": "easy", "explanation": "15% of 1900 is 285. Added to 950, the total is 1235."},
{"category": "quantitative", "question": "What is the value of 15% of 2000 + 1000?", "options": ["1300", "1500", "1200", "1400"], "correctAnswer": 0, "difficulty": "hard", "explanation": "15% of 2000 is 300. Added to 1000, the total is 1300."},
{"category": "logical", "question": "If A is coded as 1, B as 2, what is C coded as?", "options": ["2", "3", "4", "5"], "correctAnswer": 1, "difficulty": "easy", "explanation": "Alphabetical increment by 1. C will be 3."},
{"category": "logical", "question": "If A is coded as 2, B as 3, what is C coded as?", "options": ["3", "4", "5", "6"], "correctAnswer": 1, "difficulty": "medium", "explanation": "Alphabetical increment by 1. C will be 4."},
{"category": "logical", "question": "If A is coded as 3, B as 4, what is C coded as?", "options": ["4", "5", "6", "7"], "correctAnswer": 1, "difficulty": "medium", "explanation": "Alphabetical increment by 1. C will be 5."},
{"category": "logical", "question": "If A is coded as 4, B as 5, what is C coded as?", "options": ["5", "6", "7", "8"], "correctAnswer": 1, "difficulty": "medium", "explanation": "Alphabetical increment by 1. C will be 6."},
{"category": "logical", "question": "If A is coded as 5, B as 6, what is C coded as?", "options": ["6", "7", "8", "9"], "correctAnswer": 1, "difficulty": "medium", "explanation": "Alphabetical increment by 1. C will be 7."},
{"category": "logical", "question": "If A is coded as 6, B as 7, what is C coded as?", "options": ["7", "8", "9", "10"], "correctAnswer": 1, "difficulty": "medium", "explanation": "Alphabetical increment by 1. C will be 8."},
{"category": "logical", "question": "If A is coded as 7, B as 8, what is C coded as?", "options": ["8", "9", "10", "11"], "correctAnswer": 1, "difficulty": "hard", "explanation": "Alphabetical increment by 1. C will be 9."},
{"category": "logical", "question": "If A is coded as 8, B as 9, what is C coded as?", "options": ["9", "10", "11", "12"], "correctAnswer": 1, "difficulty": "easy", "explanation": "Alphabetical increment by 1. C will be 10."},
{"category": "logical", "question": "If A is coded as 9, B as 10, what is C coded as?", "options": ["10", "11", "12", "13"], "correctAnswer": 1, "difficulty": "medium", "explanation": "Alphabetical increment by 1. C will be 11."},
{"category": "logical", "question": "If A is coded as 10, B as 11, what is C coded as?", "options": ["11", "12", "13", "14"], "correctAnswer": 1, "difficulty": "medium", "explanation": "Alphabetical increment by 1. C will be 12."},
{"category": "logical", "question": "If A is coded as 11, B as 12, what is C coded as?", "options": ["12", "13", "14", "15"], "correctAnswer": 1, "difficulty": "medium", "explanation": "Alphabetical increment by 1. C will be 13."},
{"category": "logical", "question": "If A is coded as 12, B as 13, what is C coded as?", "options": ["13", "14", "15", "16"], "correctAnswer": 1, "difficulty": "hard", "explanation": "Alphabetical increment by 1. C will be 14."},
{"category": "logical", "question": "If A is coded as 13, B as 14, what is C coded as?", "options": ["14", "15", "16", "17"], "correctAnswer": 1, "difficulty": "easy", "explanation": "Alphabetical increment by 1. C will be 15."},
{"category": "logical", "question": "If A is coded as 14, B as 15, what is C coded as?", "options": ["15", "16", "17", "18"], "correctAnswer": 1, "difficulty": "hard", "explanation": "Alphabetical increment by 1. C will be 16."},
{"category": "logical", "question": "If A is coded as 15, B as 16, what is C coded as?", "options": ["16", "17", "18", "19"], "correctAnswer": 1, "difficulty": "hard", "explanation": "Alphabetical increment by 1. C will be 17."},
{"category": "logical", "question": "If A is coded as 16, B as 17, what is C coded as?", "options": ["17", "18", "19", "20"], "correctAnswer": 1, "difficulty": "hard", "explanation": "Alphabetical increment by 1. C will be 18."},
{"category": "logical", "question": "If A is coded as 17, B as 18, what is C coded as?", "options": ["18", "19", "20", "21"], "correctAnswer": 1, "difficulty": "hard", "explanation": "Alphabetical increment by 1. C will be 19."},
{"category": "logical", "question": "If A is coded as 18, B as 19, what is C coded as?", "options": ["19", "20", "21", "22"], "correctAnswer": 1, "difficulty": "easy", "explanation": "Alphabetical increment by 1. C will be 20."},
{"category": "logical", "question": "If A is coded as 19, B as 20, what is C coded as?", "options": ["20", "21", "22", "23"], "correctAnswer": 1, "difficulty": "hard", "explanation": "Alphabetical increment by 1. C will be 21."},
{"category": "logical", "question": "If A is coded as 20, B as 21, what is C coded as?", "options": ["21", "22", "23", "24"], "correctAnswer": 1, "difficulty": "easy", "explanation": "Alphabetical increment by 1. C will be 22."},
{"category": "technical", "question": "Which of the following is a key feature of Java?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 3, "difficulty": "hard", "explanation": "This is a fundamental concept in Java architecture."},
{"category": "technical", "question": "Which of the following is a key feature of Python?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 0, "difficulty": "easy", "explanation": "This is a fundamental concept in Python architecture."},
{"category": "technical", "question": "Which of the following is a key feature of React?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 0, "difficulty": "easy", "explanation": "This is a fundamental concept in React architecture."},
{"category": "technical", "question": "Which of the following is a key feature of Java?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 0, "difficulty": "hard", "explanation": "This is a fundamental concept in Java architecture."},
{"category": "technical", "question": "Which of the following is a key feature of Node.js?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 0, "difficulty": "medium", "explanation": "This is a fundamental concept in Node.js architecture."},
{"category": "technical", "question": "Which of the following is a key feature of MongoDB?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 3, "difficulty": "medium", "explanation": "This is a fundamental concept in MongoDB architecture."},
{"category": "technical", "question": "Which of the following is a key feature of MongoDB?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 1, "difficulty": "hard", "explanation": "This is a fundamental concept in MongoDB architecture."},
{"category": "technical", "question": "Which of the following is a key feature of OS?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 2, "difficulty": "easy", "explanation": "This is a fundamental concept in OS architecture."},
{"category": "technical", "question": "Which of the following is a key feature of Java?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 1, "difficulty": "hard", "explanation": "This is a fundamental concept in Java architecture."},
{"category": "technical", "question": "Which of the following is a key feature of SQL?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 3, "difficulty": "medium", "explanation": "This is a fundamental concept in SQL architecture."},
{"category": "technical", "question": "Which of the following is a key feature of Python?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 1, "difficulty": "medium", "explanation": "This is a fundamental concept in Python architecture."},
{"category": "technical", "question": "Which of the following is a key feature of Java?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 2, "difficulty": "hard", "explanation": "This is a fundamental concept in Java architecture."},
{"category": "technical", "question": "Which of the following is a key feature of React?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 3, "difficulty": "hard", "explanation": "This is a fundamental concept in React architecture."},
{"category": "technical", "question": "Which of the following is a key feature of Python?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 0, "difficulty": "easy", "explanation": "This is a fundamental concept in Python architecture."},
{"category": "technical", "question": "Which of the following is a key feature of Networking?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 1, "difficulty": "medium", "explanation": "This is a fundamental concept in Networking architecture."},
{"category": "technical", "question": "Which of the following is a key feature of SQL?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 3, "difficulty": "hard", "explanation": "This is a fundamental concept in SQL architecture."},
{"category": "technical", "question": "Which of the following is a key feature of React?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 2, "difficulty": "hard", "explanation": "This is a fundamental concept in React architecture."},
{"category": "technical", "question": "Which of the following is a key feature of MongoDB?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 3, "difficulty": "medium", "explanation": "This is a fundamental concept in MongoDB architecture."},
{"category": "technical", "question": "Which of the following is a key feature of Node.js?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 1, "difficulty": "easy", "explanation": "This is a fundamental concept in Node.js architecture."},
{"category": "technical", "question": "Which of the following is a key feature of OS?", "options": ["Feature A", "Feature B", "Feature C", "Feature D"], "correctAnswer": 2, "difficulty": "hard", "explanation": "This is a fundamental concept in OS architecture."}
,
{"category": "quantitative", "question": "A shopkeeper sells an article at a loss of 8%. If he had sold it for Rs. 200 more, he would have made a profit of 12%. What is the cost price?", "options": ["Rs. 1000", "Rs. 1200", "Rs. 800", "Rs. 1500"], "correctAnswer": 0, "difficulty": "medium", "explanation": "Difference in % = 12% - (-8%) = 20%. 20% of CP = 200. CP = 1000."},
{"category": "quantitative", "question": "The sum of ages of 5 children born at the intervals of 3 years each is 50 years. What is the age of the youngest child?", "options": ["4 years", "8 years", "10 years", "None of these"], "correctAnswer": 0, "difficulty": "medium", "explanation": "Let ages be x, x+3, x+6, x+9, x+12. Sum = 5x + 30 = 50. x = 4."},
{"category": "quantitative", "question": "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", "options": ["120 metres", "180 metres", "324 metres", "150 metres"], "correctAnswer": 3, "difficulty": "easy", "explanation": "Speed = 60 * (5/18) = 50/3 m/s. Length = (50/3) * 9 = 150m."},
{"category": "quantitative", "question": "What is the probability of getting a sum 9 from two throws of a dice?", "options": ["1/6", "1/8", "1/9", "1/12"], "correctAnswer": 2, "difficulty": "medium", "explanation": "Favorable outcomes: (3,6), (4,5), (5,4), (6,3). Total = 36. Probability = 4/36 = 1/9."},
{"category": "quantitative", "question": "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?", "options": ["7", "10", "12", "13"], "correctAnswer": 1, "difficulty": "easy", "explanation": "Alternating series: +3, -2, +3, -2. So 12 - 2 = 10."},
{"category": "logical", "question": "SCD, TEF, UGH, ____, WKL", "options": ["CMN", "UJI", "VIJ", "IJT"], "correctAnswer": 2, "difficulty": "easy", "explanation": "First letter: S, T, U, V, W. Second and third: CD, EF, GH, IJ, KL."},
{"category": "logical", "question": "Pointing to a photograph of a boy Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?", "options": ["Brother", "Uncle", "Cousin", "Father"], "correctAnswer": 3, "difficulty": "medium", "explanation": "The only son of Suresh's mother is Suresh himself. So the boy is Suresh's son."},
{"category": "logical", "question": "If in a certain language, MADRAS is coded as NBESBT, how is BOMBAY coded in that code?", "options": ["CPNCBX", "CPNCBZ", "CPOCBZ", "CQOCBZ"], "correctAnswer": 1, "difficulty": "medium", "explanation": "Each letter is shifted by +1."},
{"category": "logical", "question": "A runs faster than B but not as fast as C. D runs faster than C. Who runs the fastest?", "options": ["A", "B", "C", "D"], "correctAnswer": 3, "difficulty": "easy", "explanation": "B < A < C < D. D is the fastest."},
{"category": "logical", "question": "Statements: All bags are cakes. All lamps are cakes. Conclusions: I. Some lamps are bags. II. No lamp is bag.", "options": ["Only I follows", "Only II follows", "Either I or II follows", "Neither I nor II follows"], "correctAnswer": 2, "difficulty": "hard", "explanation": "Bags and lamps are subsets of cakes, but their relationship to each other is unknown. Hence, either some are, or none are."},
{"category": "technical", "question": "Which of the following is not a property of transactions in DBMS (ACID)?", "options": ["Atomicity", "Consistency", "Isolation", "Deadlock"], "correctAnswer": 3, "difficulty": "easy", "explanation": "ACID stands for Atomicity, Consistency, Isolation, Durability. Deadlock is an issue, not a property."},
{"category": "technical", "question": "What is the time complexity of searching an element in a balanced Binary Search Tree?", "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"], "correctAnswer": 2, "difficulty": "easy", "explanation": "In a balanced BST, the height is log n, so search takes O(log n) time."},
{"category": "technical", "question": "Which HTTP method is idempotent in RESTful services?", "options": ["POST", "PUT", "PATCH", "None of the above"], "correctAnswer": 1, "difficulty": "medium", "explanation": "PUT is idempotent because applying it multiple times has the same effect as applying it once."},
{"category": "technical", "question": "In Java, which keyword is used to prevent a class from being subclassed?", "options": ["static", "final", "const", "sealed"], "correctAnswer": 1, "difficulty": "easy", "explanation": "The 'final' keyword prevents a class from being extended."},
{"category": "technical", "question": "What is the purpose of the 'virtual' DOM in React?", "options": ["To directly manipulate the browser DOM", "To create a lightweight copy of the real DOM for faster reconciliation", "To run server-side code in the browser", "To handle database operations"], "correctAnswer": 1, "difficulty": "medium", "explanation": "The Virtual DOM is a lightweight copy of the real DOM. React uses it for efficiently calculating DOM updates via reconciliation."},
{"category": "technical", "question": "Which scheduling algorithm in Operating Systems can suffer from starvation?", "options": ["Round Robin", "First Come First Serve", "Shortest Job First", "All of the above"], "correctAnswer": 2, "difficulty": "medium", "explanation": "Shortest Job First (SJF) can lead to starvation if short processes keep arriving, preventing long processes from running."},
{"category": "technical", "question": "What is the output of 'typeof null' in JavaScript?", "options": ["null", "undefined", "object", "string"], "correctAnswer": 2, "difficulty": "easy", "explanation": "In JavaScript, 'typeof null' returns 'object' due to a historical bug in the language implementation."},
{"category": "technical", "question": "Which of the following sorting algorithms has the best average-case time complexity?", "options": ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"], "correctAnswer": 2, "difficulty": "medium", "explanation": "Merge sort has an average time complexity of O(n log n), while the others are O(n^2)."},
{"category": "technical", "question": "In Python, which built-in function is used to iterate over a sequence along with its index?", "options": ["enumerate()", "zip()", "range()", "iter()"], "correctAnswer": 0, "difficulty": "easy", "explanation": "The enumerate() function adds a counter to an iterable and returns it as an enumerate object."},
{"category": "technical", "question": "What does a 404 HTTP status code mean?", "options": ["Internal Server Error", "Unauthorized", "Not Found", "Bad Request"], "correctAnswer": 2, "difficulty": "easy", "explanation": "404 indicates that the server could not find the requested resource."}
];

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing questions
    await Question.deleteMany({});
    console.log("Cleared existing questions");

    // Insert seed data
    const inserted = await Question.insertMany(questions);
    console.log(`✅ Seeded ${inserted.length} questions`);

    console.log("\nBreakdown:");
    const quant = inserted.filter((q) => q.category === "quantitative").length;
    const logical = inserted.filter((q) => q.category === "logical").length;
    const tech = inserted.filter((q) => q.category === "technical").length;
    console.log(`  Quantitative: ${quant}`);
    console.log(`  Logical Reasoning: ${logical}`);
    console.log(`  Technical: ${tech}`);

    await mongoose.disconnect();
    console.log("\nDisconnected. Done!");
    process.exit(0);
  } catch (error) {
    console.error("Seed Error:", error);
    process.exit(1);
  }
};

seedQuestions();
