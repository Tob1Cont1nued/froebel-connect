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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ChecklistIcon from '@mui/icons-material/Checklist';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useTodos } from '../../hooks/useTodos';
import { useTeamTodos } from '../../hooks/useTeamTodos';
import { useKitaFachkraefte } from '../../hooks/useKitaFachkraefte';
import { useAuth } from '../../context/AuthContext';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Personal Todos ────────────────────────────────────────────────────────────

function PersonalTodos() {
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

  return (
    <>
      <TextField
        inputRef={inputRef}
        fullWidth size="small"
        placeholder="Neue persönliche Aufgabe …"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleAdd} disabled={!text.trim() || adding}
                  sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#95C11F' }} /></Box>
      ) : open.length === 0 && done.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled' }}>
          <ChecklistIcon sx={{ fontSize: 52, mb: 1 }} />
          <Typography variant="body2">Noch keine persönlichen Aufgaben.</Typography>
        </Box>
      ) : (
        <>
          {open.length > 0 && (
            <Card sx={{ mb: 2 }}>
              {open.map((todo, i) => (
                <Box key={todo.id}>
                  {i > 0 && <Divider />}
                  <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5 }}>
                    <Checkbox checked={false} onChange={() => toggle(todo.id)}
                      sx={{ color: '#95C11F', '&.Mui-checked': { color: '#95C11F' } }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>{todo.text}</Typography>
                    <IconButton size="small" onClick={() => remove(todo.id)}
                      sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Card>
          )}
          {done.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Erledigt</Typography>
              <Card sx={{ opacity: 0.65 }}>
                {done.map((todo, i) => (
                  <Box key={todo.id}>
                    {i > 0 && <Divider />}
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5 }}>
                      <Checkbox checked onChange={() => toggle(todo.id)}
                        sx={{ color: '#95C11F', '&.Mui-checked': { color: '#95C11F' } }} />
                      <Typography variant="body2" sx={{ flex: 1, textDecoration: 'line-through', color: 'text.secondary' }}>{todo.text}</Typography>
                      <IconButton size="small" onClick={() => remove(todo.id)}
                        sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
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
    </>
  );
}

// ─── Team Todos ────────────────────────────────────────────────────────────────

function TeamTodosList() {
  const { profile } = useAuth();
  const { todos, loading, add, toggle, claim, remove } = useTeamTodos();
  const { fachkraefte } = useKitaFachkraefte();
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<{ id: string; name: string } | null>(null);

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  const handleAdd = async () => {
    if (!text.trim() || adding) return;
    setAdding(true);
    await add(text.trim(), selectedAssignee);
    setText('');
    setSelectedAssignee(null);
    setAdding(false);
  };

  return (
    <>
      {/* Compose */}
      <Card sx={{ mb: 2, p: 1.5 }}>
        <TextField
          fullWidth size="small" multiline maxRows={3}
          placeholder="Neue Team-Aufgabe …"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small" startIcon={<PersonAddOutlinedIcon />}
            onClick={() => setAssignDialog(true)}
            variant={selectedAssignee ? 'contained' : 'outlined'}
            sx={selectedAssignee
              ? { bgcolor: '#E3F2FD', color: '#1565C0', borderColor: '#1565C0', fontWeight: 600, '&:hover': { bgcolor: '#BBDEFB' } }
              : { borderColor: 'divider', color: 'text.secondary' }
            }
          >
            {selectedAssignee ? selectedAssignee.name.split(' ')[0] : 'Zuweisen'}
          </Button>
          {selectedAssignee && (
            <IconButton size="small" onClick={() => setSelectedAssignee(null)} sx={{ color: 'text.disabled' }}>
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained" size="small" startIcon={<AddIcon />}
            disabled={!text.trim() || adding}
            onClick={handleAdd}
            sx={{ bgcolor: '#95C11F', color: '#1A3545', '&:hover': { bgcolor: '#7EA819' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
          >
            Hinzufügen
          </Button>
        </Box>
      </Card>

      {/* Assignee picker */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Aufgabe zuweisen</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List disablePadding>
            {fachkraefte.map((f, i) => (
              <Box key={f.id}>
                {i > 0 && <Divider />}
                <ListItemButton
                  selected={selectedAssignee?.id === f.id}
                  onClick={() => { setSelectedAssignee(f); setAssignDialog(false); }}
                  sx={{ px: 2, py: 1.25, '&.Mui-selected': { bgcolor: '#F1F8E9' } }}
                >
                  <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 700, fontSize: 12 }}>
                    {initials(f.name)}
                  </Avatar>
                  <ListItemText primary={f.name} />
                </ListItemButton>
              </Box>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Abbrechen</Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#95C11F' }} /></Box>
      ) : open.length === 0 && done.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled' }}>
          <GroupsIcon sx={{ fontSize: 52, mb: 1 }} />
          <Typography variant="body2">Noch keine Team-Aufgaben.</Typography>
        </Box>
      ) : (
        <>
          {open.length > 0 && (
            <Card sx={{ mb: 2 }}>
              {open.map((todo, i) => {
                const isAssignedToMe = todo.assigned_to === profile?.id;
                const isUnassigned = !todo.assigned_to;
                const canDelete = todo.created_by === profile?.id;
                return (
                  <Box key={todo.id}>
                    {i > 0 && <Divider />}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', px: 1, py: 1 }}>
                      <Checkbox checked={false} onChange={() => toggle(todo.id)}
                        sx={{ color: '#95C11F', mt: -0.5, '&.Mui-checked': { color: '#95C11F' } }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2">{todo.text}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.disabled">von {todo.created_by_name.split(' ')[0]}</Typography>
                          {todo.assigned_to_name ? (
                            <Chip
                              size="small"
                              avatar={<Avatar sx={{ width: 16, height: 16, fontSize: 9, bgcolor: isAssignedToMe ? '#95C11F' : '#E3F2FD', color: isAssignedToMe ? '#1A3545' : '#1565C0' }}>{initials(todo.assigned_to_name)}</Avatar>}
                              label={isAssignedToMe ? 'Mir zugewiesen' : todo.assigned_to_name.split(' ')[0]}
                              sx={{
                                height: 20, fontSize: 11, fontWeight: 600,
                                bgcolor: isAssignedToMe ? '#F1F8E9' : '#E3F2FD',
                                color: isAssignedToMe ? '#2E7D32' : '#1565C0',
                                border: 'none',
                              }}
                            />
                          ) : (
                            <Button size="small" onClick={() => claim(todo.id)}
                              sx={{ height: 20, fontSize: 11, fontWeight: 600, py: 0, px: 0.75, minWidth: 0, color: '#7B1FA2', bgcolor: '#F3E5F5', borderRadius: 10, '&:hover': { bgcolor: '#E1BEE7' } }}>
                              Übernehmen
                            </Button>
                          )}
                          {isUnassigned && <Typography variant="caption" color="text.disabled">· nicht zugewiesen</Typography>}
                        </Box>
                      </Box>
                      {canDelete && (
                        <IconButton size="small" onClick={() => remove(todo.id)}
                          sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' }, mt: -0.5 }}>
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Card>
          )}
          {done.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Erledigt</Typography>
              <Card sx={{ opacity: 0.65 }}>
                {done.map((todo, i) => (
                  <Box key={todo.id}>
                    {i > 0 && <Divider />}
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.75 }}>
                      <Checkbox checked onChange={() => toggle(todo.id)}
                        sx={{ color: '#95C11F', '&.Mui-checked': { color: '#95C11F' } }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>{todo.text}</Typography>
                        {todo.assigned_to_name && (
                          <Typography variant="caption" color="text.disabled">{todo.assigned_to_name.split(' ')[0]}</Typography>
                        )}
                      </Box>
                      {todo.created_by === profile?.id && (
                        <IconButton size="small" onClick={() => remove(todo.id)}
                          sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                ))}
              </Card>
            </>
          )}
        </>
      )}
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TeamTodos() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 600, mx: 'auto', width: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Aufgaben</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab label="Meine Aufgaben" sx={{ fontWeight: 600, fontSize: 13 }} />
        <Tab label="Team-Aufgaben" sx={{ fontWeight: 600, fontSize: 13 }} />
      </Tabs>

      {tab === 0 && <PersonalTodos />}
      {tab === 1 && <TeamTodosList />}
    </Box>
  );
}
