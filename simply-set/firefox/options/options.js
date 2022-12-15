browser.storage.sync.get([`key`], result => {
    if(result.key) {
        document.getElementById('key').setAttribute('value', result.key)
    }
})

browser.storage.sync.get([`refreshOnLoad`], result => {
    if(result.refreshOnLoad) {
        document.getElementById('refresh').setAttribute('checked', result.refreshOnLoad)
    }
})


function saveSettings() {
    const value = document.getElementById('key').value
    const refreshOnLoad = document.getElementById('refresh').checked
    
    browser.storage.sync.set({
        key: value,
        refreshOnLoad: refreshOnLoad,
    })

    document.getElementById('save').innerText = 'Saved'
    document.getElementById('save').disabled = true
}

function updateSave() {
    if(document.getElementById('save').innerText === 'Saved') {
        document.getElementById('save').innerText = 'Save'
        document.getElementById('save').disabled = false
    }
}

document.getElementById('save').addEventListener('click',
    saveSettings);

document.getElementById('key').addEventListener('input',
updateSave);

document.getElementById('refresh').addEventListener('click',
updateSave);