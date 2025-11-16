import { useParams } from 'react-router-dom';

function JoinPage() {
  const { codigoInvitacion } = useParams();

  return (
    <div>
      <h1>JoinPage</h1>
      <p>Unirse a natillera con código: {codigoInvitacion}</p>
    </div>
  );
}

export default JoinPage;
