const https = require('https');
const jsdom = require('jsdom');

const url = 'https://www.ptt.cc/bbs/LoveLive_Sip/M.1465409149.A.580.html';
const answer = { '繪': 0, '鳥': 1, '花': 2, '姬': 3 };

function scoring(text) {
  const m = {};
  var score = 0;
  var c;
  text = text.match(/\{\{(....)\}\}/);
  if (!text) {
    return;
  }
  text = text[1];
  for (var i = 0; i < text.length; ++i) {
    c = text.charAt(i);
    if (!(c in answer) || (c in m)) {
      continue;
    }
    m[c] = true;
    if (answer[c] === i) {
      score += 3;
    } else {
      score += 1;
    }
  }
  return score;
}

function judge(body) {
  const document = body.ownerDocument;
  const candidates = document.createElement('div');
  const highScores = {};
  const ranking = [];
  Array.prototype.forEach.call(body.querySelectorAll('.push'), (push) => {
    const userid = push.querySelector('.push-userid').textContent;
    const content = push.querySelector('.push-content').textContent;
    const score = scoring(content);
    var record;
    if (typeof score === 'undefined') {
      console.log('check ' + userid + content);
      return;
    }
    if (userid in highScores) {
      if (parseInt(highScores[userid].textContent, 10) >= score) {
        return;
      }
      record = candidates.removeChild(highScores[userid]);
    } else {
      record = document.createElement('div');
      record.id = userid;
    }
    record.textContent = score;
    highScores[userid] = candidates.appendChild(record);
  });
  Array.prototype.forEach.call(candidates.children, (candidate) => {
    const id = candidate.id;
    const score = parseInt(candidate.textContent, 10);
    if (!(score in ranking)) {
      ranking[score] = [];
    }
    ranking[score].push(id);
  });
  ranking.reverse().forEach((list, i) =>
    console.log('' + (ranking.length - i - 1) + ': ' + list.join(',')));
}

https.get(url, (response) => {
  var html;

  response.setEncoding('utf8');
  response.on('data', (data) => {
    html += data;
  });
  response.on('end', () => {
    jsdom.env(html, (err, window) => {
      if (err) {
        // TODO
        return;
      }
      judge(window.document.body);
    });
  });
}).on('error', (err) => {
  // TODO
});
