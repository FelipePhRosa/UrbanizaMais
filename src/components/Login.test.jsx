import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Login from './Login';

const VALID_USER = { identifier: 'admin@teste.com', password: 'SenhaQualquer123' };

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function fillForm(identifier = VALID_USER.identifier, password = VALID_USER.password) {
  fireEvent.change(screen.getByPlaceholderText('voce@exemplo.com'), { target: { value: identifier } });
  fireEvent.change(screen.getByPlaceholderText('Digite sua senha'), { target: { value: password } });
}

function renderLogin(loginMock = vi.fn()) {
  return render(
    <AuthContext.Provider value={{ login: loginMock }}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<div>HOME_PAGE</div>} />
          <Route path="/verifyEmail" element={<div>VERIFY_PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

function submitForm() {
  fireEvent.submit(document.querySelector('form'));
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('Login', () => {
  it('campos vazios: valida sem chamar a API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderLogin();

    submitForm();

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Informe seu e-mail ou nome de usuário.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('login válido: uma requisição com os dados do formulário e redireciona para /home', async () => {
    const loginMock = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, { token: 'tk', requiresOTP: false, userId: 1, email: VALID_USER.identifier })
    );
    vi.stubGlobal('fetch', fetchMock);
    renderLogin(loginMock);
    fillForm();
    submitForm();

    expect(await screen.findByText('HOME_PAGE')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(VALID_USER);
    expect(loginMock).toHaveBeenCalledWith('tk', expect.objectContaining({ email: VALID_USER.identifier }));
  });

  it('senha incorreta (401): mensagem genérica, sem login e sem redirecionar', async () => {
    const loginMock = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401, { error: 'Invalid credentials.' }));
    vi.stubGlobal('fetch', fetchMock);
    renderLogin(loginMock);
    fillForm();
    submitForm();

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'E-mail/usuário ou senha incorretos.');
    expect(loginMock).not.toHaveBeenCalled();
    expect(screen.queryByText('HOME_PAGE')).toBeNull();
  });

  it('falha de rede: mensagem de conexão', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);
    renderLogin();
    fillForm();
    submitForm();

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Não foi possível conectar ao servidor. Verifique sua conexão e tente de novo.');
  });

  it('erro 500: mensagem de indisponibilidade do servidor', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(500, { error: 'Internal server error.' }));
    vi.stubGlobal('fetch', fetchMock);
    renderLogin();
    fillForm();
    submitForm();

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Erro no servidor. Tente novamente em instantes.');
  });

  it('Enter repetido no mesmo tick: dispara exatamente uma requisição', async () => {
    let resolveFirst;
    const fetchMock = vi.fn().mockImplementation(
      () => new Promise((resolve) => { resolveFirst = resolve; })
    );
    vi.stubGlobal('fetch', fetchMock);
    renderLogin();
    fillForm();

    submitForm();
    submitForm();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveFirst(jsonResponse(401, { error: 'Invalid credentials.' }));
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'E-mail/usuário ou senha incorretos.');
  });

  it('nova tentativa após resposta: o botão volta a funcionar (sem trava permanente)', async () => {
    const loginMock = vi.fn();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(401, { error: 'Invalid credentials.' }))
      .mockResolvedValueOnce(jsonResponse(200, { token: 'tk', requiresOTP: false }));
    vi.stubGlobal('fetch', fetchMock);
    renderLogin(loginMock);
    fillForm();

    submitForm();
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'E-mail/usuário ou senha incorretos.');

    submitForm();
    await waitFor(() => expect(loginMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
