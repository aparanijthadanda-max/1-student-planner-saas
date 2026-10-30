const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'studentPlannerTasks';
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentFilter = 'all';

$('today').textContent = new Date().toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric', year:'numeric'});
$('notes').value = localStorage.getItem('studentPlannerNotes') || '';
$('goalInput').value = localStorage.getItem('studentPlannerGoal') || 3;

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function render(){
  const filtered = tasks.filter(t => currentFilter === 'all' || (currentFilter === 'done' ? t.done : !t.done));
  $('taskList').innerHTML = '';
  $('emptyState').hidden = filtered.length > 0;
  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' completed' : '');
    const check = document.createElement('input'); check.type = 'checkbox'; check.checked = task.done;
    check.setAttribute('aria-label', 'Mark task completed');
    check.addEventListener('change', () => { task.done = check.checked; save(); render(); });
    const info = document.createElement('div'); info.className = 'task-info';
    const title = document.createElement('div'); title.className = 'task-title'; title.textContent = task.title;
    const meta = document.createElement('div'); meta.className = 'task-meta';
    meta.textContent = task.subject + (task.due ? ' • Due ' + task.due : '');
    info.append(title, meta);
    const del = document.createElement('button'); del.className = 'delete-btn'; del.textContent = 'Delete';
    del.addEventListener('click', () => { tasks = tasks.filter(t => t.id !== task.id); save(); render(); });
    li.append(check, info, del); $('taskList').append(li);
  });
  const done = tasks.filter(t => t.done).length;
  $('totalCount').textContent = tasks.length;
  $('doneCount').textContent = done;
  $('remainingCount').textContent = tasks.length - done;
  updateGoal(done);
}
function updateGoal(done){
  const goal = Math.max(1, Number($('goalInput').value) || 1);
  $('progressBar').style.width = Math.min(100, done / goal * 100) + '%';
  $('goalText').textContent = `${done} of ${goal} tasks completed`;
}
$('taskForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = $('taskInput').value.trim();
  if(!title) return;
  tasks.unshift({id: Date.now(), title, subject: $('subjectInput').value, due: $('dueInput').value, done:false});
  save(); $('taskForm').reset(); render(); $('taskInput').focus();
});
document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => {
  currentFilter = btn.dataset.filter;
  document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === btn));
  render();
}));
$('notes').addEventListener('input', () => localStorage.setItem('studentPlannerNotes', $('notes').value));
$('goalInput').addEventListener('input', () => {
  localStorage.setItem('studentPlannerGoal', $('goalInput').value);
  updateGoal(tasks.filter(t => t.done).length);
});
render();
