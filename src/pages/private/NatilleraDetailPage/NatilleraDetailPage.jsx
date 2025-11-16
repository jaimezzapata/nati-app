import { useParams } from 'react-router-dom';

function NatilleraDetailPage() {
  const { natilleraId } = useParams();

  return (
    <div>
      <h1>NatilleraDetailPage</h1>
      <p>Detalle de natillera ID: {natilleraId}</p>
    </div>
  );
}

export default NatilleraDetailPage;
