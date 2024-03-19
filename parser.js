
const DOM = {
    getLootElement(){
        return `
        <div class="form-row">
            <label for="item-id">Item ID</label>
            <input type="text" name="item-id" id="item-id">
        </div>
        <div class="form-row">
            <label for="quantity">Quantity</label>
            <input type="text" name="quantity" id="quantity">
        </div>
        <div class="form-row">
            <label for="rarity">Rarity</label>
            <select name="rarity" id="rarity">
                <option value="normal">Normal</option>
                <option value="rare">Rare</option>
                <option value="super-rare">Super Rare</option>
                <option value="conditional">Conditional</option>
            </select>
        </div>
        <button class="delete-loot" id="delete-loot">X</button>
        `;
    },
    addLoot(){
        const lootEntry = document.createElement('div');
        lootEntry.innerHTML = DOM.getLootElement();
        lootEntry.classList.add('loot-entry');
        document.getElementById('loot-entries').appendChild(lootEntry);
        App.reload();
    }, 
    deleteLoot(event){
        event.target.parentElement.remove();
    }
}
const JSONSerializer = {
    generateLang(){
        let mobID = document.getElementById('mob_id').value;
        mobID = mobID.replace(':', '_');
        const langName = document.getElementById('lang-name').value;
        const langSpawnCondition = document.getElementById('lang-spawn-condition').value;
        const langDescription = document.getElementById('lang-description').value;
        const output = `{\n\t"${JSONSerializer.getLangSyntax(mobID)}.name": "${langName}",\n\t"${JSONSerializer.getLangSyntax(mobID)}.spawn_condition": "${langSpawnCondition}",\n\t"${JSONSerializer.getLangSyntax(mobID)}.description": "${langDescription}",\n} `
        console.log(output);
        JSONSerializer.generateJSONFile(output, mobID + '_lang');
    },
    getLangSyntax(mobID){
        return `bestiary.mob.${mobID}`;
    },
    generateMobData(){
        let mobID = document.getElementById('mob_id').value;
        const behavior = document.getElementById('mob_id').value;
        const lootElements = document.querySelectorAll('.loot-entry');

        let output = `{\n\t"mob_id": "${mobID}",\n\t"behavior": "${behavior}"`;

        if(lootElements.length > 0){
            output += `,\n\t"loot": [`;

            lootElements.forEach((element, index) =>{
                const itemID = element.querySelector('#item-id').value;
                const quantity = element.querySelector('#quantity').value;
                const rarity = element.querySelector('#rarity').value;
                
                output += `\n\t\t{\n\t\t\t"item": "${itemID}",\n\t\t\t"quantity": "${quantity}",\n\t\t\t"rarity": "${rarity}"\n\t\t}`;
                
                if(index < lootElements.length - 1){
                    output += `,`;                    
                }
            });
            output += `\n\t]\n}`;
        }else{
            output += `\n}`;
        }
        console.log(output);
        JSONSerializer.generateJSONFile(output, mobID.replace(':', "_"));
    },

    generateJSONFile(fileContent = '', fileName ='file'){
        let blobFile = new Blob([fileContent], { type: 'application/json'});
        let link = document.createElement('a');
        link.download = fileName + '.json';
        link.href = window.URL.createObjectURL(blobFile);
        link.click();
        link.remove();
    }
}

const EventListeners = {
    addStaticEventListeners(){
        document.getElementById('add-loot').addEventListener('click', DOM.addLoot);
        document.getElementById('generate-mob-data').addEventListener('click', JSONSerializer.generateMobData);
        document.getElementById('generate-lang').addEventListener('click', JSONSerializer.generateLang);
    },
    addDynamicEventListeners(){
        document.querySelectorAll('#delete-loot').forEach(element => {
            element.addEventListener('click', event => DOM.deleteLoot(event));
        });
    }
}

const App = {
    init(){
        App.reload();
        EventListeners.addStaticEventListeners();
    },
    reload(){
        EventListeners.addDynamicEventListeners();
    }
}

App.init();