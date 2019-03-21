var states = document.getElementById("states");
var convert = document.getElementById("convert");
var n, m, b; //numb of states , alphabet and isEpsilonNfa
var nfaST = []; // stateTransition Table
var I, F; //initial and final states input
convert.classList.add("invisible");

states.addEventListener("click", event => {
  event.preventDefault();
  var input = document.getElementById("input");
  input.innerHTML = "";

  var table = document.createElement("table");
  table.classList.add("table");
  table.classList.add("table-bordered");
  table.classList.add("table-hover");
  table.classList.add("table-sm");
  table.classList.add("table-light");
  n = document.getElementById("nofstates").value;
  m = document.getElementById("nofsymbols").value;
  if (!n || !m) {
    alert("Enter states and symbols please!");
    return;
  }
  b = document.getElementById("EpsilonNFA").checked;
  I = document.getElementById("initials").value.toString();
  F = document.getElementById("finals").value.toString();
  if (!I || !F) {
    alert("Enter Initial and Final state(s) please!");
    return;
  }
  nfaST = [];
  var tr = '<thead class="thead"> <tr>';
  tr = tr + `<th scope="col">Q\E</th>`;
  if (b == true) {
    for (let i = 0; i < m - 1; i++) {
      tr = tr + `<th scope="col">${i}</th>`;
    }
    tr = tr + `<th scope="col">ε</th>`;
  } else {
    for (let i = 0; i < m; i++) {
      tr = tr + `<th scope="col">${i}</th>`;
    }
  }
  tr = tr + "</tr> </thead>";
  tr = tr + "<tbody>";
  for (let i = 0; i < n; i++) {
    tr = tr + "<tr>";
    tr = tr + `<td><strong>Q${i}<strong></td>`;

    for (let j = 0; j < m; j++) {
      tr =
        tr +
        `<td><input class="form-control form-control-sm" type='text' id = stateTable${i}${j}></td>`;
    }
    tr = tr + "</tr>";
  }
  table.innerHTML = tr;

  var p = document.createElement("p");
  p.innerHTML = "Enter the state transition table for the NFA:";
  input.appendChild(p);
  input.appendChild(table);
  convert.classList.remove("invisible");
  convert.classList.add("visible");
});

convert.addEventListener("click", event => {
  event.preventDefault();
  initials = I.split(" ");
  finals = F.split(" ");
  var a = [];
  nfaST = [];
  for (var i = 0; i < n; i++) {
    var a = [];
    for (var j = 0; j < m; j++) {
      var temp = "stateTable" + i.toString() + j.toString();
      a.push(document.getElementById(temp).value);
    }
    nfaST.push(a);
  }
  if (!valid(nfaST)) {
    alert("Enter valid Transition Table!");
    return;
  }

  if (b == true) {
    NFAtoDFA(convertToNfa(nfaST));
  } else {
    NFAtoDFA(nfaST);
  }
});

function equal(num, q, spaces) {
  spaces++;
  return spaces == q && q == num;
}

function checkStateValidity(state) {
  if (state == "") return true;
  var q = 0;
  var num = 0;
  var spaces = 0;
  var other = 0;

  for (var i = 0; i < state.length; i++) {
    var y = state.charAt(i);
    if (y == "Q") q++;
    else if (y >= "0" && y <= "9") num++;
    else if (y == " ") spaces++;
    else other++;
  }
  if (other != 0 || !equal(num, q, spaces)) return false;
  return true;
}

function valid(NFA) {
  if (!NFA) return false;
  var count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (NFA[i][j] != "") count++;
      if (checkStateValidity(NFA[i][j]) == false) return false;
    }
  }
  if (count == 0) return false;
  return true;
}

function MyUnion(ans) {
  if (ans == "") return ans;
  var temp = ans.split(" ");
  var u = [];
  for (let i = 0; i < temp.length; i++) {
    if (u.indexOf(temp[i]) == -1) u.push(temp[i]);
  }
  u.sort();
  ans = "";
  var iflag = false,
    fflag = false;
  if (initials.indexOf(u[0]) !== -1) iflag = true;
  if (finals.indexOf(u[0]) !== -1) fflag = true;
  ans = u[0];
  for (let i = 1; i < u.length; i++) {
    if (initials.indexOf(u[i]) !== -1) iflag = true;
    if (finals.indexOf(u[i]) !== -1) fflag = true;
    ans = ans + " " + u[i];
  }

  if (iflag) initials.push(ans);
  if (fflag) finals.push(ans);
  return ans;
}

function find(state, nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (state == nodes[i]) {
      return 1;
    }
  }
  return 0;
}

function helper(state, NFAtable, DFAtable, nodes) {
  var col = m;
  if (b == true) col = m - 1;
  var splitStates = state.split(" ");
  if (splitStates.length == 1) {
    var y = splitStates[0].split("Q")[1];

    var temp = [];
    for (var i = 0; i < col; i++) {
      var transitionState = NFAtable[y][i];
      transitionState = MyUnion(transitionState);
      if (!find(transitionState, nodes) && transitionState != "") {
        nodes.push(transitionState);
      }
      temp.push(transitionState);
    }
    DFAtable.push(temp);
  } else {
    var temp = [];
    console.log("Split", splitStates);
    for (var i = 0; i < col; i++) {
      var ans = "";

      for (var j = 0; j < splitStates.length; j++) {
        var y = splitStates[j].charAt(1);

        if (y != "") {
          if (ans != "" && NFAtable[y][i] != "")
            ans = ans + " " + NFAtable[y][i];
          else ans += NFAtable[y][i];
        }
      }
      ans = MyUnion(ans);
      temp.push(ans);
      if (!find(ans, nodes) && ans != "") nodes.push(ans);
    }
    DFAtable.push(temp);
  }
}

function NFAtoDFA(NFAtable) {
  var nodes = [];
  var DFAtable = [];
  if (NFAtable) nodes.push(I);
  var index = 0;
  while (1) {
    helper(nodes[index], NFAtable, DFAtable, nodes);
    if (index == nodes.length - 1) break;
    else index++;
  }
  displayDfa(DFAtable, nodes);
}

function displayDfa(dfaTable, dfaStates) {
  if (b === true) {
    m = m - 1;
  }
  let container = document.getElementById("newTab");
  let table = document.createElement("table");

  table.classList.add("table");
  table.classList.add("table-bordered");
  table.classList.add("table-hover");
  table.classList.add("table-sm");
  table.classList.add("table-light");

  var tr = '<thead class="thead"> <tr>';
  tr = tr + `<th scope="col">Q \ E</th>`;

  for (let i = 0; i < m; i++) {
    tr = tr + `<th scope="col">${i}</th>`;
  }

  tr = tr + "</tr> </thead>";
  tr = tr + "<tbody>";
  let statesNumber = 0;
  for (let i = 0; i < dfaStates.length; i++) {
    if (dfaStates[i].charAt(0) != " ") {
      statesNumber++;
    }
  }
  for (let i = 0; i < statesNumber; i++) {
    tr = tr + "<tr>";

    if (finals.indexOf(dfaStates[i]) !== -1) {
      tr = tr + `<td class="finals"><strong>${dfaStates[i]}<strong></td>`;
    } else {
      tr = tr + `<td><strong>${dfaStates[i]}<strong></td>`;
    }

    for (let j = 0; j < m; j++) {
      if (dfaTable[i][j] === "") {
        tr = tr + `<td> Error State</td>`;
      } else {
        tr = tr + `<td> ${dfaTable[i][j]}</td>`;
      }
    }
    tr = tr + "</tr>";
  }
  table.innerHTML = tr;
  var div = document.createElement("div");
  div.innerHTML = "<h2>Dfa Table:</h2>";
  var small = document.createElement("small");
  small.innerHTML =
    "Initial state is first row and red states are final states";
  div.appendChild(small);
  container.appendChild(div);
  container.appendChild(table);
}
function convertToNfa(epsilonNfa) {
  var nfaTable = [];
  for (let i = 0; i < epsilonNfa.length; i++) {
    var temp = [];
    if (epsilonNfa[i][2] === "") {
      var newArr = `Q${i}`;
    } else {
      var newArr = `Q${i}` + " " + epsilonNfa[i][2];
    }
    var s = newArr.split(" ");
    for (let j = 0; j < m - 1; j++) {
      temp.push(getClosure(s, j));
    }
    nfaTable.push(temp);
  }
  console.log("end", nfaTable);
  displayNFA(nfaTable);
  return nfaTable;
}
function displayNFA(nfaTable) {
  let container = document.getElementById("newTab");
  let table = document.createElement("table");

  table.classList.add("table");
  table.classList.add("table-bordered");
  table.classList.add("table-hover");
  table.classList.add("table-sm");
  table.classList.add("table-light");

  var tr = '<thead class="thead"> <tr>';
  tr = tr + `<th scope="col">Q \ E</th>`;

  for (let i = 0; i < m - 1; i++) {
    tr = tr + `<th scope="col">${i}</th>`;
  }

  tr = tr + "</tr> </thead>";
  tr = tr + "<tbody>";

  for (let i = 0; i < n; i++) {
    tr = tr + "<tr>";

    if (finals.indexOf(`Q${i}`) !== -1) {
      tr = tr + `<td class="finals"><strong>Q${i}<strong></td>`;
    } else {
      tr = tr + `<td><strong>Q${i}<strong></td>`;
    }

    for (let j = 0; j < m - 1; j++) {
      if (nfaTable[i][j] === "") {
        tr = tr + `<td> &#1060</td>`;
      } else {
        tr = tr + `<td> ${nfaTable[i][j]}</td>`;
      }
    }
    tr = tr + "</tr>";
  }
  table.innerHTML = tr;
  var div = document.createElement("div");
  div.innerHTML = "<h2>NFA Table:</h2>";
  var small = document.createElement("small");
  small.innerHTML =
    "Initial state is first row and red states are final states";
  div.appendChild(small);
  container.appendChild(div);
  container.appendChild(table);
}

function getClosure(states, letter) {
  console.log(states);
  var arr = [];
  for (let i = 0; i < states.length; i++) {
    if (nfaST[states[i].charAt(1)][letter] != "") {
      arr.push(nfaST[states[i].charAt(1)][letter]);
    }
  }
  console.log("s", arr);

  var array = [];
  for (let i = 0; i < arr.length; i++) {
    let num = arr[i].charAt(1);

    array.push(`Q${num}`);
    array.push(nfaST[num][2]);
  }

  console.log("dpn", array);

  return array.join(" ");
}
