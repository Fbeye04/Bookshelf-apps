// Array untuk menyimpan data buku
const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF-APPS';

// Fungsi untuk menghasilkan ID unik untuk setiap buku
function generateId() {
    return +new Date();
}

// Fungsi untuk membuat objek buku
function generateBookObject(id, title, author, year, isComplete) {
    return { id, title, author, year, isComplete };
}

// Fungsi untuk mencari buku berdasarkan ID
function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

// Fungsi untuk mencari indeks buku berdasarkan ID
function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

// Fungsi untuk memeriksa apakah browser mendukung localStorage
function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false;
    }
    return true;
}

// Fungsi untuk menyimpan data buku ke localStorage
function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

// Fungsi untuk memuat data buku dari localStorage
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

// Fungsi untuk menambahkan buku baru
function addBook() {
    const titleBook = document.getElementById('inputBookTitle').value;
    const authorBook = document.getElementById('inputBookAuthor').value;
    const year = parseInt(document.getElementById('inputBookYear').value);
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, titleBook, authorBook, year, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Fungsi untuk membuat elemen daftar buku
function makeList(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${bookObject.author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun: ${bookObject.year}`;

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');

    const article = document.createElement('article');
    article.classList.add('book_item');
    article.append(textTitle, textAuthor, textYear, actionContainer);

    if (bookObject.isComplete) {
        const notFinishButton = document.createElement('button');
        notFinishButton.classList.add('green');
        notFinishButton.innerText = "Belum selesai dibaca";

        notFinishButton.addEventListener('click', function () {
            undoTaskFromCompleted(bookObject.id);
        });

        const deleteBookButton = document.createElement('button');
        deleteBookButton.classList.add('red');
        deleteBookButton.innerText = "Hapus buku";

        deleteBookButton.addEventListener('click', function () {
            showDialog(bookObject.id);
        });

        const editBookButton = document.createElement('button');
        editBookButton.classList.add('blue');
        editBookButton.innerText = "Edit buku";

        editBookButton.addEventListener('click', function () {
            editBook(bookObject.id);
        });

        actionContainer.append(notFinishButton, editBookButton, deleteBookButton);
    } else {
        const finishReadButton = document.createElement('button');
        finishReadButton.classList.add('green');
        finishReadButton.innerText = "Selesai dibaca";

        finishReadButton.addEventListener('click', function () {
            addTaskToCompleted(bookObject.id);
        });

        const deleteBookButton = document.createElement('button');
        deleteBookButton.classList.add('red');
        deleteBookButton.innerText = "Hapus buku";

        deleteBookButton.addEventListener('click', function () {
            showDialog(bookObject.id);
        });

        const editBookButton = document.createElement('button');
        editBookButton.classList.add('blue');
        editBookButton.innerText = "Edit buku";

        editBookButton.addEventListener('click', function () {
            editBook(bookObject.id);
        });

        actionContainer.append(finishReadButton, editBookButton, deleteBookButton);
    }

    return article;
}

// Fungsi untuk menandai buku sebagai selesai dibaca
function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Fungsi untuk menghapus buku dari daftar
function removeTaskFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Fungsi untuk mengembalikan buku ke daftar belum selesai dibaca
function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Fungsi untuk mengedit buku
function editBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    const newTitle = prompt("Masukkan judul buku baru", bookTarget.title);
    const newAuthor = prompt("Masukkan penulis buku baru", bookTarget.author);
    const newYear = parseInt(prompt("Masukkan tahun terbit buku baru", bookTarget.year));

    if (newTitle != null && newAuthor != null && !isNaN(newYear)) {
        bookTarget.title = newTitle;
        bookTarget.author = newAuthor;
        bookTarget.year = newYear;
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Fungsi untuk menampilkan dialog konfirmasi penghapusan buku
function showDialog(bookId) {
    const confirmation = confirm("Apakah Anda yakin ingin menghapus buku ini?");
    if (confirmation) {
        removeTaskFromCompleted(bookId);
    }
}

// Fungsi untuk melakukan pencarian berdasarkan judul buku
function performSearch() {
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    const uncompletedBookRead = document.getElementById('incompleteBookshelfList');
    uncompletedBookRead.innerHTML = '';

    const completedBookRead = document.getElementById('completeBookshelfList');
    completedBookRead.innerHTML = '';

    for (const bookItem of books) {
        const bookTitle = bookItem.title.toLowerCase();
        if (bookTitle.includes(searchTitle)) {
            const bookShelfElement = makeList(bookItem);
            if (!bookItem.isComplete) {
                uncompletedBookRead.append(bookShelfElement);
            } else {
                completedBookRead.append(bookShelfElement);
            }
        }
    }
}

// Event listener untuk menyimpan data ke localStorage
document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

// Event listener untuk merender ulang daftar buku
document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookRead = document.getElementById('incompleteBookshelfList');
    uncompletedBookRead.innerHTML = '';

    const completedBookRead = document.getElementById('completeBookshelfList');
    completedBookRead.innerHTML = '';

    for (const bookItem of books) {
        const bookShelfElement = makeList(bookItem);
        if (!bookItem.isComplete) {
            uncompletedBookRead.append(bookShelfElement);
        } else {
            completedBookRead.append(bookShelfElement);
        }
    }
});

// Event listener untuk memuat data dari localStorage ketika DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        performSearch();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});