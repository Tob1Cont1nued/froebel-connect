import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { useTodos } from '../../hooks/useTodos';

export default function TeamTodos() {
  const { open, done, loading, add, toggle, remove } = useTodos();
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async () => {
    if (!text.trim() || adding) return;
    setAdding(true);
    await add(text.trim());
    setText('');
    setAdding(false);
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 600, mx: 'auto', width: '100%' }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Meine Aufgaben</Typography>
        <Typography variant="caption" color="text.secondary">
          {open.length} offen{done.length > 0 ? ` · ${done.length} erledigt` : ''}
        </Typography>
      </Box>

      {/* Input */}
      <TextField
        inputRef={inputRef}
        fullWidth
        size="small"
        placeholder="Neue Aufgabe hinzufügen …"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleAdd}
                  disabled={!text.trim() || adding}
                  sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#95C11F' }} />
        </Box>
      ) : open.length === 0 && done.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled' }}>
          <ChecklistIcon sx={{ fontSize: 52, mb: 1 }} />
          <Typography variant="body2">Noch keine Aufgaben.</Typography>
          <Typography variant="caption">Füge deine erste Aufgabe hinzu.</Typography>
        </Box>
      ) : (
        <>
          {/* Open todos */}
          {open.length > 0 && (
            <Card sx={{ mb: 2 }}>
              {open.map((todo, i) => (
                <Box key={todo.id}>
                  {i > 0 && <Divider />}
                  <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5 }}>
                    <Checkbox
                      checked={false}
                      onChange={() => toggle(todo.id)}
                      sx={{ color: '#95C11F', '&.Mui-checked': { color: '#95C11F' } }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>{todo.text}</Typography>
                    <IconButton size="small" onClick={() => remove(todo.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Card>
          )}

          {/* Done todos */}
          {done.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                Erledigt
              </Typography>
              <Card sx={{ opacity: 0.65 }}>
                {done.map((todo, i) => (
                  <Box key={todo.id}>
                    {i > 0 && <Divider />}
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5 }}>
                      <Checkbox
                        checked={true}
                        onChange={() => toggle(todo.id)}
                        sx={{ color: '#95C11F', '&.Mui-checked': { color: '#95C11F' } }}
                      />
                      <Typography variant="body2" sx={{ flex: 1, textDecoration: 'line-through', color: 'text.secondary' }}>
                        {todo.text}
                      </Typography>
                      <IconButton size="small" onClick={() => remove(todo.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Card>
            </>
          )}
        </>
      )}
    </Box>
  );
}
