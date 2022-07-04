/* contiene i dati di fetch */
let fetching = {}

/* contiene delle info utili per le funzioni che filtrano */
let utility = {
    titleFilter: {},
    statusFilter: {},
    titleSorting: {},
    statusSorting: {},
}

let gridDivEl = document.querySelector("div.grid")

let filterTitleInput = document.querySelector("div.filter-title input")
let filterStatusButton = document.querySelector("div.filter-status button")
let sortingTitleButton = document.querySelector("div.title-sorting button")
let sortingStatusButton = document.querySelector("div.status-sorting button")

/* funzione che esegue fetch e contiene tutti gli event listener */
async function firstFetching() {

    /* esegue fetch e salva i dati nel session storage e se nel session storage (quindi in caso di refresh) 
       sono gia presenti questi dati al posto di eseguire fetch va a prendere i valori dallo storage */
    if (!sessionStorage.getItem("fetching")) {
        fetching.response = await fetch("https://jsonplaceholder.typicode.com/todos", { method: "GET" })
        fetching.body = await fetching.response.json()
        sessionStorage.setItem("fetching", JSON.stringify(fetching.body))
    }
    else {
        let fetchingStorageData = sessionStorage.getItem("fetching")
        fetching.body = JSON.parse(fetchingStorageData)
    }

    /* esegue la funzione con il parametro una variabile contenente i dati della richiesta fetch */
    placeTicket(fetching.body)


    utility.statusFilter.filteredTicketCompleted = fetching.body.filter(ticket => ticket.completed === true)
    utility.statusFilter.filteredTicketNotCompleted = fetching.body.filter(ticket => ticket.completed === false)

    let ticketsToSortAZ = [...fetching.body]
    utility.titleSorting.sortedTicketAZ = ticketsToSortAZ.sort((a, b) => (a.title < b.title) ? -1 : 1)
    let ticketsToSortZA = [...ticketsToSortAZ]
    utility.titleSorting.sortedTicketZA = ticketsToSortZA.reverse()

    utility.statusSorting.sortedCompleted = [...utility.statusFilter.filteredTicketCompleted].concat([...utility.statusFilter.filteredTicketNotCompleted])
    utility.statusSorting.sortedNotCompleted = [...utility.statusFilter.filteredTicketNotCompleted].concat([...utility.statusFilter.filteredTicketCompleted])

    /* filtri */
    filterTitleInput.addEventListener("keyup", titleFilter)
    filterStatusButton.addEventListener("click", statusFilter)

    /* riordina */
    sortingTitleButton.addEventListener("click", titleSorting)
    sortingStatusButton.addEventListener("click", statusSorting)
}
firstFetching()



/* funzione che accetta un array di object composti dalle chiavi id title e completed 
   e andrà a creare i ticket per ognuno di questi object */
function placeTicket(arrayOfTicket) {
    arrayOfTicket.forEach(ticket => {
        let newElements = {}

        newElements.DivEl = document.createElement("div")
        newElements.DivEl.classList.add("ticket")
        for (let i = 1; i <= 3; i++) {
            newElements["spanEl" + i] = document.createElement("span")
        }
        newElements.spanEl1.textContent = ticket.id
        newElements.spanEl2.textContent = ticket.title
        newElements.spanEl3.textContent = (ticket.completed === true) ? "completed" : "not completed"

        for (let i = 1; i <= 3; i++) {
            newElements.DivEl.append(newElements["spanEl" + i])
        }
        gridDivEl.append(newElements.DivEl)
    })
}



/* una funzione che toglie tutti i ticket */
function clearTicket() {
    document.querySelectorAll("div.ticket").forEach(ticket => ticket.remove())
}



/* una funzione che filtra i ticket in base al title e il testo in input */
function titleFilter() {
    let ticketCollection = []
    ticketCollection = [...fetching.body]
    if (utility.statusFilter.active) {
        if (filterStatusButton.textContent.includes("status filter: completed")) {
            ticketCollection = [...utility.statusFilter.filteredTicketCompleted]
        }
        else {
            ticketCollection = [...utility.statusFilter.filteredTicketNotCompleted]
        }
    }
    if (utility.titleSorting.active) {
        ticketCollection.sort((a, b) => (a.title < b.title) ? -1 : 1)
        if (sortingTitleButton.textContent.includes("Z-A")) ticketCollection.reverse()
    }
    if (utility.statusSorting.active) {
        let completed = ticketCollection.filter(ticket => ticket.completed === true);
        let notCompleted = ticketCollection.filter(ticket => ticket.completed === false);

        if (sortingStatusButton.textContent.includes("not completed")) {
            ticketCollection = [...notCompleted].concat([...completed])
        }
        else {
            ticketCollection = [...completed].concat([...notCompleted])
        }
    }
    let textInInput = filterTitleInput.value
    let filteredTicket = ticketCollection.filter(ticket => ticket.title.includes(textInInput))
    clearTicket()
    placeTicket(filteredTicket)
    utility.titleFilter.filtetedTicket = filteredTicket
    if (textInInput) {
        utility.titleFilter.active = true
    }
}



/* filtra i ticket in base allo status */
function statusFilter() {
    let filteredTicket = []
    if (filterStatusButton.textContent.includes("status filter: inactive")) {
        filterStatusButton.textContent = "status filter: completed"
        filteredTicket = [...utility.statusFilter.filteredTicketCompleted]
        utility.statusFilter.active = true
    }

    else if (filterStatusButton.textContent.includes("status filter: completed")) {
        filterStatusButton.textContent = "status filter: not completed"
        filteredTicket = [...utility.statusFilter.filteredTicketNotCompleted]
        utility.statusFilter.active = true
    }

    else {
        filterStatusButton.textContent = "status filter: inactive"
        filteredTicket = [...fetching.body]
        utility.statusFilter.active = false
    }
    clearTicket()
    placeTicket(filteredTicket)
    if (utility.titleFilter.active || utility.statusSorting.active || utility.titleSorting.active) {
        titleFilter()
    }
}



function titleSorting() {
    let sortedTicket = []

    if (sortingTitleButton.textContent.includes("not active")) {
        sortingTitleButton.textContent = "A-Z"
        utility.titleSorting.active = true
        sortedTicket = [...utility.titleSorting.sortedTicketAZ]
    }

    else if (sortingTitleButton.textContent.includes("A-Z")) {
        sortingTitleButton.textContent = "Z-A"
        utility.titleSorting.active = true
        sortedTicket = [...utility.titleSorting.sortedTicketZA]
    }

    else if (sortingTitleButton.textContent.includes("Z-A")) {
        sortingTitleButton.textContent = "not active"
        utility.titleSorting.active = false
        sortedTicket = [...fetching.body]
    }

    clearTicket()
    placeTicket(sortedTicket)
    if (utility.titleFilter.active || utility.statusFilter.active || utility.statusSorting.active) {
        titleFilter()
    }
}



function statusSorting() {
    let sortedTicket = []

    if (sortingStatusButton.textContent.includes("not active")) {
        sortingStatusButton.textContent = "completed"
        utility.statusSorting.active = true
        sortedTicket = [...utility.statusSorting.sortedCompleted]
    }

    else if (sortingStatusButton.textContent.includes("not completed")) {
        sortingStatusButton.textContent = "not active"
        utility.statusSorting.active = false
        sortedTicket = [...fetching.body]
    }
    else if (sortingStatusButton.textContent.includes("completed")) {
        sortingStatusButton.textContent = "not completed"
        utility.statusSorting.active = true
        sortedTicket = [...utility.statusSorting.sortedNotCompleted]
    }


    clearTicket()
    placeTicket(sortedTicket)
    if (utility.titleFilter.active || utility.statusFilter.active || utility.titleSorting.active) {
        titleFilter()
    }
}



