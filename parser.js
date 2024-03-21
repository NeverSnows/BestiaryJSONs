const DOM = {
    createLootEntry(pSource = '', pItemId = '', pQuantity = '', pRarity = ''){
        const lootEntry = document.createElement('div');
        lootEntry.classList.add('loot-entry');

        function createFormRow(labelText, inputType, inputId, inputValue) {
            const formRow = document.createElement('div');
            formRow.classList.add('form-row');

            const label = document.createElement('label');
            label.htmlFor = inputId;
            label.textContent = labelText;

            const input = document.createElement('input');
            input.type = inputType;
            input.id = inputId;
            input.value = inputValue;

            formRow.appendChild(label);
            formRow.appendChild(input);

            return formRow;
        }

        lootEntry.appendChild(createFormRow('Item Source', 'text', 'item-source', pSource));
        lootEntry.appendChild(createFormRow('Item ID', 'text', 'item-id', pItemId));
        lootEntry.appendChild(createFormRow('Quantity', 'text', 'quantity', pQuantity));

        const rarityRow = document.createElement('div');
        rarityRow.classList.add('form-row');

        const rarityLabel = document.createElement('label');
        rarityLabel.htmlFor = 'rarity';
        rarityLabel.textContent = 'Rarity';

        const raritySelect = document.createElement('select');
        raritySelect.name = 'rarity';
        raritySelect.id = 'rarity';

        const rarities = ['Normal', 'Rare', 'Super Rare', 'Conditional'];
        rarities.forEach(rarity => {
            const option = document.createElement('option');
            const rarityValue = rarity.toLowerCase().replace(' ', '-');
            option.value = rarityValue;
            option.textContent = rarity;
            if(rarityValue == (pRarity.replace('_', '-'))){
                option.selected = true;
            }
            raritySelect.appendChild(option);
        });

        rarityRow.appendChild(rarityLabel);
        rarityRow.appendChild(raritySelect);
        lootEntry.appendChild(rarityRow);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-loot');
        deleteButton.id = 'delete-loot';
        deleteButton.textContent = 'X';
        lootEntry.appendChild(deleteButton);

        return lootEntry;
    },
    addLoot(source, itemId, quantity, rarity){
        const lootEntry = DOM.createLootEntry(source, itemId, quantity, rarity)
        document.getElementById('loot-entries').appendChild(lootEntry);
        App.reload();
    }, 
    onAddLoot(){
        DOM.addLoot();
    },
    deleteLoot(event){
        event.target.parentElement.remove();
    },
    deleteAllLootEntries(){
        document.getElementById('loot-entries').innerHTML = '';
    },

    onInsertFile(event){
        const curFiles = event.target.files;

        if(curFiles.length !== 0){
            let reader = new FileReader();
            reader.onload = (evt) => {
                let result = evt.target.result;
                console.log(result);
                if(Utils.isJSON(curFiles[0])){
                    DOM.setFieldsFromJSON(JSON.parse(result));
                }else if(Utils.isZip(curFiles[0])){
                    DOM.unpackZip(result)
                }
            }
            reader.readAsText(curFiles[0]);
        }
    },

    setFieldsFromJSON(object){
        DOM.deleteAllLootEntries();
        document.getElementById('source').value = Utils.getSourceFromID(object.mob_id).source;
        document.getElementById('mob-id').value = Utils.getSourceFromID(object.mob_id).id;
        document.getElementById('behavior').value = object.behavior;
        object.loot.forEach(entry =>{
            const source = Utils.getSourceFromID(entry.item).source;
            const itemId = Utils.getSourceFromID(entry.item).id;

            DOM.addLoot(source, itemId, entry.quantity, entry.drop_rate);
        });
    },
    unpackZip(zipFile){  
        /*      
        JSZip.loadAsync(zipFile).then(zip => {
            console.log(zip);
        }).catch(err => {
            console.error("Failed to open" + filename + " as ZIP file: " + err);
        })
        */
    }
}
const Utils = {
    isJSON(file) {  
        return file.type == 'application/json';
    },
    isZip(file){
        return file.type == 'application/zip';
    },

    getSourceFromID(gameId = ''){
        const dataArray = gameId.split(':');

        return {
            source: dataArray[0],
            id: dataArray[1]
        };
            
    }
}
const JSONSerializer = {
    generateLang(){
        const langName = document.getElementById('lang-name').value;
        const langSpawnCondition = document.getElementById('lang-spawn-condition').value;
        const langDescription = document.getElementById('lang-description').value;

        const outputObject = {};
        outputObject[JSONSerializer.getLangKey() + `name`] = langName;
        outputObject[JSONSerializer.getLangKey() + `spawn_condition`] = langSpawnCondition;
        outputObject[JSONSerializer.getLangKey() + `description`] = langDescription;

        console.log(JSON.stringify(outputObject, null, 2));
        JSONSerializer.generateJSONFile(outputObject, mobID + '_lang');
    },
    getLangKey(){
        const source = document.getElementById('source').value;
        const mobID = document.getElementById('mob-id').value;
        return `snowsbestiary.entry.${source + '.' + mobID}.`;
    },
    generateMobData(){
        const source = document.getElementById('source').value;
        const mobID = document.getElementById('mob-id').value;
        const behavior = document.getElementById('mob-id').value;
        const lootElements = document.querySelectorAll('.loot-entry');

        const outputObject = {
            mod_id: source + ':' + mobID,
            behavior: behavior
        }

        if(lootElements.length > 0){
            outputObject.loot = [];

            lootElements.forEach((element, index) =>{
                const itemSource = element.querySelector('#item-source').value;
                const itemID = element.querySelector('#item-id').value;
                const quantity = element.querySelector('#quantity').value;
                const rarity = element.querySelector('#rarity').value;
                
                const lootObject = {
                    itemID: itemSource + ':' + itemID,
                    quantity: quantity,
                    drop_rate: rarity
                };
                outputObject.loot.push(lootObject);
            });
        }

        console.log(JSON.stringify(outputObject, null, 2));
        JSONSerializer.generateJSONFile(outputObject, source + '_' + mobID);
    },

    generateJSONFile(fileContent = '', fileName ='file'){
        let blobFile = new Blob([JSON.stringify(fileContent, null, 2)], { type: 'application/json'});
        let link = document.createElement('a');
        link.download = fileName + '.json';
        link.href = window.URL.createObjectURL(blobFile);
        link.click();
        link.remove();
    }
}

const EventListeners = {
    addStaticEventListeners(){
        document.getElementById('add-loot').addEventListener('click', DOM.onAddLoot);
        document.getElementById('generate-mob-data').addEventListener('click', JSONSerializer.generateMobData);
        document.getElementById('generate-lang').addEventListener('click', JSONSerializer.generateLang);
        document.getElementById('file-input').addEventListener('change', DOM.onInsertFile);
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
