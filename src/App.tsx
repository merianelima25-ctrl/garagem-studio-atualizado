import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

type Aluno = {
  id?: string;
  nome: string;
  valor: number;
  data: string;
};

export default function App() {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  // 🔥 LISTAR EM TEMPO REAL
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "alunos"), (snapshot) => {
      const lista: Aluno[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Aluno, "id">),
      }));
      setAlunos(lista);
    });

    return () => unsubscribe();
  }, []);

  // ➕ ADICIONAR
  const adicionarAluno = async () => {
    if (!nome || !valor || !data) return;

    await addDoc(collection(db, "alunos"), {
      nome,
      valor: Number(valor),
      data,
    });

    setNome("");
    setValor("");
    setData("");
  };

  // ❌ DELETAR
  const deletarAluno = async (id?: string) => {
    if (!id) return;
    await deleteDoc(doc(db, "alunos", id));
  };

  // 📊 CALCULOS
  const hoje = new Date();

  const totalPago = alunos
    .filter((a) => new Date(a.data) >= hoje)
    .reduce((acc, a) => acc + Number(a.valor), 0);

  const totalAtrasado = alunos
    .filter((a) => new Date(a.data) < hoje)
    .reduce((acc, a) => acc + Number(a.valor), 0);

  return (
    <div style={{ display: "flex" }}>
      {/* MENU */}
      <div
        style={{
          width: "200px",
          background: "#111",
          color: "#fff",
          height: "100vh",
          padding: "20px",
        }}
      >
        <h2>🔥 Garagem</h2>
        <p>Dashboard</p>
        <p>Alunos</p>
        <p>Financeiro</p>
      </div>

      {/* CONTEÚDO */}
      <div style={{ padding: "20px", width: "100%" }}>
        <h1>Dashboard</h1>

        {/* CARDS */}
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ background: "green", padding: "20px", color: "#fff" }}>
            R$ {totalPago}
          </div>

          <div style={{ background: "red", padding: "20px", color: "#fff" }}>
            R$ {totalAtrasado}
          </div>

          <div style={{ background: "orange", padding: "20px", color: "#fff" }}>
            {alunos.length} alunos
          </div>
        </div>

        {/* CADASTRO */}
        <h2 style={{ marginTop: "20px" }}>Cadastrar Aluno</h2>

        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <br />

        <input
          placeholder="Valor"
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
        <br />

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
        <br />

        <button onClick={adicionarAluno}>Cadastrar</button>

        {/* LISTA */}
        <h2>Alunos</h2>

        <ul>
          {alunos.map((aluno) => {
            const vencimento = new Date(aluno.data);
            const emDia = vencimento >= hoje;

            return (
              <li
                key={aluno.id}
                style={{
                  color: emDia ? "green" : "red",
                  marginBottom: "10px",
                }}
              >
                {aluno.nome} - R$ {aluno.valor} - {aluno.data}
                <button
                  onClick={() => deletarAluno(aluno.id)}
                  style={{ marginLeft: "10px" }}
                >
                  ❌
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
