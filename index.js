let input = document.querySelector('input');
let name = document.getElementById('name');
let team = document.getElementById('team');
let options = document.getElementById('options');
let hint = document.getElementById('hint');
let face = document.getElementById('face');
let facereveal = document.getElementById('facereveal');
let data = document.getElementById('data');

//todays date
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = mm + '/' + dd + '/' + yyyy;

let correct = false;
//real person's data
let real;
//real player's birth
let birth;
//data of person guessed
let guessdata;
//gets birth in mm/dd//yyyy
function getplayerbirth(date) {
    date = date.split('');
    date.splice(10);
    date = date.join('').split('-');
    date = [`${date[1]}/${date[2]}/${date[0]}`].join('');
    return date;
}

//list of leagues and teams
const leagues = ['AL West', 'AL Central', 'AL East', 'NL West', 'NL Central', 'NL East'];
const teams = {
    0: ['HOU', 'LAA', 'OAK', 'SEA', 'TEX'],
    1: ['CWS', 'CLE', 'MIN', 'DET', 'KC'],
    2: ['NYY', 'BOS', 'TB', 'BAL'],
    3: ['LAD', 'SF', 'SD', 'ARI', 'COL'],
    4: ['MIL', 'CHC', 'STL', 'CIN', 'PIT'],
    5: ['NYM', 'ATL', 'PHI', 'MIA', 'WSH', 'MTL']
}


//get league
function getleague(team) {
    let index = Object.keys(teams).find(key => teams[key].includes(team));
    return leagues[index];
}
//subtracts today from birthday to get age
function getage(today, birthday) {
    let difference = Math.abs(new Date(today) - new Date(birthday));
    let days = difference/(1000 * 3600 * 24);
    let realage = Math.floor(days/365);
    return realage;
}

function exception(id) {
    if (id === 'league') {
        let realleague = getleague(real.team_abbrev);
        let guessleague = getleague(guessdata.team_abbrev);
        let div = document.createElement('div');
        div.classList.add('guess');
        div.textContent = guessleague;
        if (realleague === guessleague) {
            div.style.background = '#1cfc03';
        } else if (realleague.split(' ')[0] === guessleague.split(' ')[0] || realleague.split(' ')[1] === guessleague.split(' ')[1]) {
            div.style.background = '#f2ca44';
        }
         else {
            div.style.background = 'gray';
        }
        data.append(div);
    } else if (id === 'bats' || id === 'throws') {
        let div = document.createElement('div');
        div.classList.add('guess');
        div.textContent = guessdata[id];
        if (guessdata[id] === real[id]) {
            div.style.background = '#1cfc03';
        } else if (real[id] === 'S' || real[id] === 'B') {
            div.style.background = '#f2ca44';
        } else {
            div.style.background = 'gray';
        }
        data.append(div);
    } else if (id === 'age') {
        let guessdate = getplayerbirth(guessdata.birth_date);
        let div = document.createElement('div');
        div.classList.add('guess');
        let realage = getage(today, birth);
        let guessage = getage(today, guessdate);
        div.textContent = guessage;
        if (realage === guessage) {
            div.style.background = '#1cfc03';
        } else if (guessage < realage + 3 || guessage > realage - 3) {
            div.style.background = '#f2ca44';
        }
         else {
            div.style.background = 'gray';
        }
        data.append(div);
    } else if (id === 'weight') {
        let div = document.createElement('div');
        div.classList.add('guess');
        div.textContent = guessdata.weight;
        if (guessdata.weight === real.weight) {
            div.style.background = '#1cfc03';
        } else if (guessdata.weight < real.weight + 10 || guessdata.weight > real.weight - 10) {
            div.style.background = '#f2ca44';
        } else {
            div.style.background = 'gray';
        }
        data.append(div);
    }
}

//when player guesses
function guess(athlete) {
    async function guessplayer() {
        //array is the 3 words of athlete's name. After splice, array = 3rd word aka index 2
        let array = athlete.split(' ');
        let test = array.splice(0, 2).join(' ');
        if (test === 'Will Smith' || test === 'Diego Castillo') {
            let response = await fetch(`http://lookup-service-prod.mlb.com/json/named.search_player_all.bam?sport_code='mlb'&active_sw='Y'&name_part='${test}%25'`);
            let data = await response.json();
            data = data.search_player_all.queryResults.row;
            if (data[0].team_abbrev === array.join('')) {
                guessdata = data[0];
                return guessdata;
            } else {
                guessdata = data[1];
                return guessdata;
            }
        }
        let response = await fetch(`http://lookup-service-prod.mlb.com/json/named.search_player_all.bam?sport_code='mlb'&active_sw='Y'&name_part='${athlete}%25'`);
        let data = await response.json();
        //data of person guessed
        guessdata = data.search_player_all.queryResults.row;
        return guessdata;
    }
    guessplayer()
        .then(guessdata => {
            for (let i = 0; i < 9; i++) {
                if (i === 2 || i === 3 || i === 4 || i === 8 || i === 6) {
                    exception(data.children[i].id);
                    continue;
                }
                let div = document.createElement('div');
                div.textContent = guessdata[data.children[i].id];
                div.classList.add('guess');
                if (i === 0 && correct === false) {
                    div.style.background = 'white';
                } else if (div.textContent === real[data.children[i].id]) {
                    div.style.background = '#1cfc03';
                } else {
                    div.style.background = 'gray';
                }
                data.append(div);
            }
        })
        .catch(error => console.log(error));
}

//gets random player
let person;
let abc = 'abcdefghijklmnopqrstuvwxyz';
let randomletter = abc[Math.floor(Math.random() * 26)];
async function getPlayer() {
    let response = await fetch(`http://lookup-service-prod.mlb.com/json/named.search_player_all.bam?sport_code='mlb'&active_sw='Y'&name_part='${randomletter}%25'`);
    let data = await response.json();
    return data;
}
getPlayer()
    .then(data => {
        data = data.search_player_all.queryResults.row[Math.floor(Math.random() * data.search_player_all.queryResults.row.length)];
        real = data;
        person = data.name_display_first_last;
        birth = getplayerbirth(data.birth_date);
        face.src = `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${data.player_id}/headshot/67/current`;
    })
    .catch(error => console.log(error));

//when user presses hint
facereveal.addEventListener('click', () => {
    hint.style.display = 'none';
    face.style.display = 'block';
})



let info;
//clears list of players when input value changes
function clearOptions() {
    while (options.firstChild) {
        options.removeChild(options.firstChild);
    }
}

//fetches data and generates player
input.addEventListener('input', () => {
    let answer = input.value;
    //if nothing in input box
    if (answer === '') {
        options.style.display = 'none';
        return;
    }

        async function getMLB() {
        let response = await fetch(`http://lookup-service-prod.mlb.com/json/named.search_player_all.bam?sport_code='mlb'&active_sw='Y'&name_part='${answer}%25'`);
        let data = await response.json();
        return data;
    }
    getMLB()
        .then(data => {
            clearOptions();
            info = data.search_player_all.queryResults.row;
        })
        .then(() => {
            //list of players appears
            options.style.display = 'block';
            //if info/data is an object with length > 1
            if (typeof info === 'object' && info.length !== undefined) {
                info.splice(10);
                let i = info.length - 1;
                while (i >= 0) {
                    let div = document.createElement('div');
                    div.classList.add('option');
                    if (info[i].name_display_first_last === 'Diego Castillo' || info[i].name_display_first_last === 'Will Smith') {
                        div.textContent = info[i].name_display_first_last + ' ' + info[i].team_abbrev;
                    } else {
                        div.textContent = info[i].name_display_first_last;
                    }
                    options.append(div);
                    i--;
                }
            } 
            //if info/data is undefined
            else if (info === undefined) {
                options.style.display = 'none';
            }
            //info/data must not be undefined or have length, so there is only 1 object
            else {
                let div = document.createElement('div');
                div.classList.add('option');
                div.textContent = info.name_display_first_last;
                options.append(div);
            }
        })
        .then(() => {
            //sees if user clicks on an option from list of players
            document.querySelectorAll('.option').forEach(val => {
                val.addEventListener('click', (e) => {
                    if (e.target.textContent === person) {
                        correct = true;
                        let div = document.createElement('div');
                        div.classList.add('congrats');
                        div.innerHTML = `<p style="margin-bottom: 1%">Congratulations!</p><img style="width: 60%; height: 70%;" src=${face.src}><button class='button' id='again'>Play Again</button>`;
                        document.body.append(div);
                        document.getElementById('again').addEventListener('click', () => {
                            location.reload();
                        })
                    }
                    options.style.display = 'none';
                    clearOptions();
                    guess(val.textContent);
                })
            })
        })
        .catch((error) => console.log(error));
});

document.getElementById('giveup').addEventListener('click', () => {
    let div = document.createElement('div');
    div.classList.add('congrats');
    div.innerHTML = `<p style="margin-bottom: 1%">Player was ${real.name_display_first_last}!</p><img style="width: 60%; height: 70%;" src=${face.src}><button class='button' id='again'>Play Again</button>`;
    document.body.append(div);
    div.onclick = function() {
        div.remove();
    }
    document.getElementById('again').addEventListener('click', () => {
        location.reload();
    })
})