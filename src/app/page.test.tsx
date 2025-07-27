import { render, screen, fireEvent, within } from '@testing-library/react';
import Home from './page';

describe('Todo App', () => {
  it('should add a new todo item', () => {
    render(<Home />);

    const inputElement = screen.getByLabelText(/add a new todo/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(inputElement, { target: { value: 'Test Todo' } });
    fireEvent.click(addButton);

    const todoItem = screen.getByText(/Test Todo/i);
    expect(todoItem).toBeInTheDocument();
  });

  it('should sort todo items by latest and oldest', () => {
    render(<Home />);

    const inputElement = screen.getByLabelText(/add a new todo/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(inputElement, { target: { value: 'Todo 1' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Todo 2' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Todo 3' } });
    fireEvent.click(addButton);

    const todoItems = screen.getAllByRole('listitem');
    expect(todoItems.length).toBe(3);

    // Default sort (latest first)
    expect(within(todoItems[0]).getByText('Todo 3')).toBeInTheDocument();
    expect(within(todoItems[1]).getByText('Todo 2')).toBeInTheDocument();
    expect(within(todoItems[2]).getByText('Todo 1')).toBeInTheDocument();

    // Sort by oldest
    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.mouseDown(sortSelect);
    const oldestOption = screen.getByRole('option', { name: /oldest first/i });
    fireEvent.click(oldestOption);

    const sortedTodoItemsOldest = screen.getAllByRole('listitem');
    expect(within(sortedTodoItemsOldest[0]).getByText('Todo 1')).toBeInTheDocument();
    expect(within(sortedTodoItemsOldest[1]).getByText('Todo 2')).toBeInTheDocument();
    expect(within(sortedTodoItemsOldest[2]).getByText('Todo 3')).toBeInTheDocument();

    // Sort by latest (again)
    fireEvent.mouseDown(sortSelect);
    const latestOption = screen.getByRole('option', { name: /latest first/i });
    fireEvent.click(latestOption);

    const sortedTodoItemsLatest = screen.getAllByRole('listitem');
    expect(within(sortedTodoItemsLatest[0]).getByText('Todo 3')).toBeInTheDocument();
    expect(within(sortedTodoItemsLatest[1]).getByText('Todo 2')).toBeInTheDocument();
    expect(within(sortedTodoItemsLatest[2]).getByText('Todo 1')).toBeInTheDocument();
  });

  it('should filter todo items by status', () => {
    render(<Home />);

    const inputElement = screen.getByLabelText(/add a new todo/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    // Add some todos
    fireEvent.change(inputElement, { target: { value: 'Todo A' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Todo B' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Todo C' } });
    fireEvent.click(addButton);

    // Mark Todo B as completed
    const todoBCheckbox = screen.getByRole('checkbox', { name: /Todo B checkbox/i });
    fireEvent.click(todoBCheckbox);

    // Filter by Completed
    const completedFilterButton = screen.getByRole('button', { name: /completed/i });
    fireEvent.click(completedFilterButton);
    expect(screen.getByText('Todo B')).toBeInTheDocument();
    expect(screen.queryByText('Todo A')).not.toBeInTheDocument();
    expect(screen.queryByText('Todo C')).not.toBeInTheDocument();

    // Filter by Active
    const activeFilterButton = screen.getByRole('button', { name: /active/i });
    fireEvent.click(activeFilterButton);
    expect(screen.queryByText('Todo B')).not.toBeInTheDocument();
    expect(screen.getByText('Todo A')).toBeInTheDocument();
    expect(screen.getByText('Todo C')).toBeInTheDocument();

    // Filter by All
    const allFilterButton = screen.getByRole('button', { name: /all/i });
    fireEvent.click(allFilterButton);
    expect(screen.getByText('Todo A')).toBeInTheDocument();
    expect(screen.getByText('Todo B')).toBeInTheDocument();
    expect(screen.getByText('Todo C')).toBeInTheDocument();
  });

  it('should show a confirmation dialog before deleting a todo item', () => {
    render(<Home />);

    const inputElement = screen.getByLabelText(/add a new todo/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(inputElement, { target: { value: 'Todo to Delete' } });
    fireEvent.click(addButton);

    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);

    expect(screen.getByText(/Are you sure you want to delete this todo?/i)).toBeInTheDocument();
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(screen.queryByText('Todo to Delete')).not.toBeInTheDocument();
  });

  it('should allow bulk deletion of selected todo items', () => {
    render(<Home />);

    const inputElement = screen.getByLabelText(/add a new todo/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    // Add some todos
    fireEvent.change(inputElement, { target: { value: 'Todo X' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Todo Y' } });
    fireEvent.click(addButton);
    fireEvent.change(inputElement, { target: { value: 'Todo Z' } });
    fireEvent.click(addButton);

    // Select Todo X and Todo Z for deletion
    const selectX = screen.getByRole('checkbox', { name: /select Todo X/i });
    fireEvent.click(selectX);
    const selectZ = screen.getByRole('checkbox', { name: /select Todo Z/i });
    fireEvent.click(selectZ);

    // Click bulk delete button
    const bulkDeleteButton = screen.getByRole('button', { name: /delete selected/i });
    fireEvent.click(bulkDeleteButton);

    // Confirm deletion
    expect(screen.getByText(/Are you sure you want to delete selected todos?/i)).toBeInTheDocument();
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    // Assert that selected todos are gone, and unselected todo remains
    expect(screen.queryByText('Todo X')).not.toBeInTheDocument();
    expect(screen.getByText('Todo Y')).toBeInTheDocument();
    expect(screen.queryByText('Todo Z')).not.toBeInTheDocument();
  });
});