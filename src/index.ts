import { observable, autorun } from './observable';

const counter = observable({
  count: 1,
});

const person = observable({
  name: 'test1',
});

function mount() {
  const root = document.getElementById('root');
  const count = document.createElement('div');
  const incrementButton = document.createElement('button');
  incrementButton.innerText = 'Increment';

  incrementButton.addEventListener('click', () => {
    counter.count++;
  });

  const decrementButton = document.createElement('button');
  decrementButton.innerText = 'Decrement';

  decrementButton.addEventListener('click', () => {
    counter.count--;
  });

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.addEventListener('keyup', () => {
    person.name = nameInput.value;
  });

  const nameShow = document.createElement('p');

  const nameContainer = document.createElement('div');
  nameContainer.append(nameInput);
  nameContainer.append(nameShow);

  autorun(() => {
    count.innerText = `Count: ${counter.count}`;
  });

  autorun(() => {
    nameInput.value = person.name;
    nameShow.innerText = `Name: ${person.name}`;
  });

  root.append(count);
  root.append(incrementButton);
  root.append(decrementButton);
  root.append(nameContainer);
}

mount();
