export default function Loading() {
  return <div aria-label="Carregando Conselho de Classe" aria-busy="true"><div className="loading-heading" /><div className="metrics dashboard-metrics">{Array.from({ length: 4 }, (_, index) => <div className="card metric" key={index}><div className="skeleton" style={{ height: 13, width: "55%" }} /><div className="skeleton" style={{ height: 32, width: "38%", marginTop: 14 }} /></div>)}</div><div className="card section">{Array.from({ length: 3 }, (_, index) => <div className="skeleton loading-row" key={index} />)}</div></div>;
}
