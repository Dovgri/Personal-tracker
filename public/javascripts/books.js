const bookRows = document.querySelectorAll('.bookRow');
const modal = document.getElementById('myModal');
const closeBtn = document.getElementsByClassName('close')[0];
const deleteBtn = document.getElementById('deleteButton');

const statusMap = {
    'Skaitoma': 'reading',
    'Neperskaityta': 'not_read',
    'Baigta': 'finished',
};

let currentBookId = null;

bookRows.forEach(bookRow => {
    bookRow.addEventListener('dblclick', () => {
        currentBookId = bookRow.dataset.id;

        let [bookTitle, bookAuthor, bookGenre, bookReadDate, bookStatus] = bookRow.children;

        bookTitle = bookTitle ? bookTitle.textContent : '';
        bookAuthor = bookAuthor ? bookAuthor.textContent : '';
        bookGenre = bookGenre ? bookGenre.textContent : '';
        bookReadDate = bookReadDate ? bookReadDate.textContent.replaceAll(' ', '-') : '';
        bookStatus = bookStatus?.textContent ? (statusMap[bookStatus.textContent] ?? '') : '';

        document.getElementById('modalTitle').value = bookTitle;
        document.getElementById('modalAuthor').value = bookAuthor;
        document.getElementById('modalGenre').value = bookGenre;
        document.getElementById('modalReadDate').value = bookReadDate;
        document.getElementById('modalStatus').value = bookStatus;

        modal.style.display = 'block';
    });
});

function closeModal() {
    modal.style.display = 'none';
    currentBookId = null;
}

closeBtn.onclick = () => {
    updateBook();
    closeModal();
};

window.onclick = (event) => {
    if (event.target === modal) {
        updateBook();
        closeModal();
    }
};

async function updateBook() {
    if (!currentBookId) return;

    const updatedBook = {
        title: document.getElementById('modalTitle').value,
        author: document.getElementById('modalAuthor').value,
        genre: document.getElementById('modalGenre').value,
        readDate: document.getElementById('modalReadDate').value,
        status: document.getElementById('modalStatus').value,
    };

    try {
        const response = await fetch(`/books/${currentBookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBook),
        });
        if (!response.ok) throw new Error('Update failed');
        location.reload();
    } catch (err) {
        console.error('Error updating book:', err);
    }
}

deleteBtn.onclick = () => {
    deleteBook();
    closeModal();
}
async function deleteBook(){
    if (!currentBookId) return;

    try{
        const response = await fetch(`/books/${currentBookId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Deletion failed');
        location.reload();
    } catch (err) {
        console.error('Error deleting book:', err);
    }
}