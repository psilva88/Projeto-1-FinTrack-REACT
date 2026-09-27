import { useState } from "react";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { formatarMoeda } from "../utils/formatar";


// Tons derivados do verde e do coral da identidade
const CORES = [
  "#0e8a5f",
  "#c4453b",
  "#2f6f8f",
  "#b8842b",
  "#6b5b95",
  "#1d8f8a",
  "#a4553f",
  "#4a7c3f",
];


function GraficoCategorias({ dados }) {
  // Guarda a fatia sob o cursor para destacar também na lista ao lado
  const [emFoco, setEmFoco] = useState(null);


  if (!dados || dados.length === 0) {
    return (
      <p className="text-muted mb-0">
        Sem despesas no período. Lance uma transação para ver a divisão dos
        gastos.
      </p>
    );
  }


  const total = dados.reduce((soma, item) => soma + item.total, 0);

  const grafico = dados.map((item) => ({
    nome: item.categoria.nome,
    valor: item.total,
    percentual: item.percentual,
  }));


  return (
    <div className="row g-3 align-items-center">


      <div className="col-12 col-sm-6">
        {/* Rosca: o buraco do meio mostra o total, sem poluir as fatias */}
        <div className="position-relative">

          <ResponsiveContainer width="100%" height={210}>
            <PieChart>

              <Pie
                data={grafico}
                dataKey="valor"
                nameKey="nome"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={95}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
                onMouseEnter={(_, indice) => setEmFoco(indice)}
                onMouseLeave={() => setEmFoco(null)}
              >
                {grafico.map((item, indice) => (
                  <Cell
                    key={item.nome}
                    fill={CORES[indice % CORES.length]}
                    opacity={emFoco === null || emFoco === indice ? 1 : 0.35}
                    style={{ cursor: "pointer", transition: "opacity .15s" }}
                  />
                ))}
              </Pie>

            </PieChart>
          </ResponsiveContainer>


          <div
            className="position-absolute top-50 start-50 translate-middle text-center"
            style={{ pointerEvents: "none" }}
          >
            <span
              className="d-block text-muted text-truncate"
              style={{ fontSize: "0.72rem", maxWidth: "6.5rem" }}
            >
              {emFoco === null ? "Total" : grafico[emFoco].nome}
            </span>

            <span className="valor" style={{ fontSize: "0.95rem" }}>
              {formatarMoeda(
                emFoco === null ? total : grafico[emFoco].valor
              )}
            </span>
          </div>

        </div>
      </div>


      <div className="col-12 col-sm-6">
        <ul className="list-unstyled mb-0">

          {grafico.map((item, indice) => (
            <li
              key={item.nome}
              className="d-flex align-items-center gap-2 py-1 linha-legenda"
              onMouseEnter={() => setEmFoco(indice)}
              onMouseLeave={() => setEmFoco(null)}
              style={{
                opacity: emFoco === null || emFoco === indice ? 1 : 0.45,
              }}
            >

              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  flexShrink: 0,
                  background: CORES[indice % CORES.length],
                }}
              ></span>

              <span className="text-truncate">{item.nome}</span>

              <span className="ms-auto valor" style={{ fontSize: "0.88rem" }}>
                {formatarMoeda(item.valor)}
              </span>

              <span
                className="text-muted"
                style={{ fontSize: "0.78rem", minWidth: "3rem", textAlign: "right" }}
              >
                {item.percentual}%
              </span>

            </li>
          ))}

        </ul>
      </div>


    </div>
  );
}


export default GraficoCategorias;
