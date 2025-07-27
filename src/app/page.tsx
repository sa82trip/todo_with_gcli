'use client';

import { useState, useMemo } from 'react';
import { Container, TextField, Button, Typography, Box, List, ListItem, ListItemText, IconButton, Checkbox, FormControl, InputLabel, Select, MenuItem, ButtonGroup, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { SelectChangeEvent } from '@mui/material/Select';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest' | 'completed_first' | 'uncompleted_first'>('latest');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [todoToDeleteId, setTodoToDeleteId] = useState<number | null>(null);
  const [selectedTodoIds, setSelectedTodoIds] = useState<number[]>([]);

  const handleAddTodo = () => {
    if (newTodoText.trim() !== '') {
      const newTodo: TodoItem = {
        id: Date.now(),
        text: newTodoText.trim(),
        completed: false,
      };
      setTodos((prevTodos) => [...prevTodos, newTodo]);
      setNewTodoText('');
    }
  };

  const handleDeleteClick = (id: number | 'bulk') => {
    if (id === 'bulk') {
      setTodoToDeleteId(null); // Indicate bulk deletion
    } else {
      setTodoToDeleteId(id);
    }
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (todoToDeleteId !== null) {
      // Single deletion
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoToDeleteId));
    } else if (selectedTodoIds.length > 0) {
      // Bulk deletion
      setTodos((prevTodos) => prevTodos.filter((todo) => !selectedTodoIds.includes(todo.id)));
      setSelectedTodoIds([]);
    }
    setTodoToDeleteId(null);
    setOpenConfirmDialog(false);
  };

  const handleCancelDelete = () => {
    setTodoToDeleteId(null);
    setOpenConfirmDialog(false);
  };

  const handleToggleComplete = (id: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value as typeof sortOrder);
  };

  const handleFilterChange = (newFilter: 'all' | 'active' | 'completed') => {
    setFilter(newFilter);
  };

  const handleSelectTodo = (id: number) => {
    setSelectedTodoIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((todoId) => todoId !== id)
        : [...prevSelected, id]
    );
  };

  const sortedTodos = useMemo(() => {
    let sorted = [...todos];
    switch (sortOrder) {
      case 'latest':
        sorted.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        sorted.sort((a, b) => a.id - b.id);
        break;
      case 'completed_first':
        sorted.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? -1 : 1));
        break;
      case 'uncompleted_first':
        sorted.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
        break;
      default:
        break;
    }
    return sorted;
  }, [todos, sortOrder]);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return sortedTodos.filter(todo => !todo.completed);
      case 'completed':
        return sortedTodos.filter(todo => todo.completed);
      case 'all':
      default:
        return sortedTodos;
    }
  }, [sortedTodos, filter]);

  const dialogMessage = todoToDeleteId !== null
    ? "Are you sure you want to delete this todo?"
    : "Are you sure you want to delete selected todos?";

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Todo App
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Add a new todo"
            variant="outlined"
            fullWidth
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTodo();
              }
            }}
          />
          <Button variant="contained" onClick={handleAddTodo}>
            Add
          </Button>
        </Box>
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="sort-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              id="sort-select"
              value={sortOrder}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="latest">Latest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="completed_first">Completed First</MenuItem>
              <MenuItem value="uncompleted_first">Uncompleted First</MenuItem>
            </Select>
          </FormControl>
          <ButtonGroup fullWidth aria-label="filter buttons">
            <Button
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => handleFilterChange('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'contained' : 'outlined'}
              onClick={() => handleFilterChange('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'completed' ? 'contained' : 'outlined'}
              onClick={() => handleFilterChange('completed')}
            >
              Completed
            </Button>
          </ButtonGroup>
        </Box>
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDeleteClick('bulk')}
          disabled={selectedTodoIds.length === 0}
          sx={{ mb: 2 }}
        >
          Delete Selected
        </Button>
        <List>
          {filteredTodos.map((todo) => (
            <ListItem
              key={todo.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(todo.id)}>
                  <DeleteIcon />
                </IconButton>
              }
              sx={{ textDecoration: todo.completed ? 'line-through' : 'none', color: todo.completed ? 'text.secondary' : 'inherit' }}
            >
              <Checkbox
                edge="start"
                checked={selectedTodoIds.includes(todo.id)}
                tabIndex={-1}
                disableRipple
                onChange={() => handleSelectTodo(todo.id)}
                inputProps={{ 'aria-label': `select ${todo.text}` }}
              />
              <Checkbox
                edge="start"
                checked={todo.completed}
                tabIndex={-1}
                disableRipple
                onChange={() => handleToggleComplete(todo.id)}
                inputProps={{ 'aria-label': `${todo.text} checkbox` }}
              />
              <ListItemText primary={todo.text} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Dialog
        open={openConfirmDialog}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
