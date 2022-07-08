let input = document.querySelector('input');
let name = document.getElementById('name');
let team = document.getElementById('team');
let options = document.getElementById('options');

let info;

function clearOptions() {
    for (let i = 0; i < options.children.length; i++) {
        options.children[i].remove();
    }
}
document.querySelectorAll('.option').forEach(val => {
    val.addEventListener('click', () => {
        clearOptions();
    })
})

input.addEventListener('input', () => {
    clearOptions();
    let answer = input.value;
        async function getMLB() {
        let response = await fetch(`http://lookup-service-prod.mlb.com/json/named.search_player_all.bam?sport_code='mlb'&active_sw='Y'&name_part='${answer}%25'`);
        let data = await response.json();
        return data;
    }
    getMLB()
        .then(data => {
            info = data.search_player_all.queryResults.row;
        })
        .then(() => {
            options.style.display = 'block';
            if (info.length >= 10) {
                for (let i = 0; i < 10; i++) {
                    let div = document.createElement('div');
                    options.append(div);
                    div.style.background = 'cyan';
                    div.style.width = '100%';
                    div.style.height = '15px';
                    div.classList.add('option');
                    div.textContent = info[i].name_display_first_last;
                }
            } else {
                for (let i = 0; i < info.length; i++) {
                    let div = document.createElement('div');
                    options.append(div);
                    div.style.background = 'cyan';
                    div.style.width = '100%';
                    div.style.height = '15px';
                    div.classList.add('option');
                    div.textContent = info[i].name_display_first_last;
                }
            }
        })
        .catch(() => options.style.display = 'none');
});