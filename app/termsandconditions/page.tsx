import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vanguardistas - Términos y Condiciones",
  description: "Términos y condiciones de uso de Vanguardistas.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">
          Política de Tratamiento de Datos Personales
        </h1>

        <div className="space-y-8 text-white/80">
          <p>
            Este documento establece las políticas y procedimientos de Vanguardistas SAS con respecto a la recolección, almacenamiento, uso, circulación y supresión de datos personales, en estricto cumplimiento de la Ley 1581 de 2012 y sus decretos reglamentarios.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. Responsable del Tratamiento de Datos
            </h2>
            <p>
              El responsable del tratamiento de los datos personales es{" "}
              <span className="text-pink-accent font-medium">Vanguardistas SAS</span>, con domicilio en Calle 99a #70g 06 Bogotá y con NIT 901740540-9.
            </p>
            <p className="mt-2">
              <strong>Canal de Atención:</strong> Para cualquier consulta, reclamo o ejercicio de derechos, por favor contactarnos a través del correo electrónico{" "}
              <span className="text-green-accent font-medium">gerencia@vanguardistas.co</span>{" "}
              o al teléfono +57 3005143853.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              2. Finalidad del Tratamiento de Datos
            </h2>
            <p className="mb-2">Los datos personales recolectados serán utilizados para las siguientes finalidades:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Realizar el diagnóstico personalizado del estado de madurez digital de los clientes potenciales.</li>
              <li>Contactar a los clientes potenciales para presentarles el diagnóstico y ofrecerles una sesión de consultoría.</li>
              <li>Gestionar, administrar y mejorar la plataforma de diagnóstico y los servicios ofrecidos.</li>
              <li>Enviar información promocional sobre productos y servicios de Vanguardistas, siempre con autorización previa y expresa del titular.</li>
              <li>Cumplir con las obligaciones legales y regulatorias de Vanguardistas.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. Derechos del Titular de los Datos
            </h2>
            <p className="mb-2">De acuerdo con la Ley 1581 de 2012, el titular de los datos personales tendrá los siguientes derechos:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Acceso (Conocimiento):</strong> Conocer la información que sobre él se ha recogido en las bases de datos.</li>
              <li><strong>Actualización y Rectificación:</strong> Actualizar sus datos si han cambiado y rectificar aquellos que son inexactos, incompletos, fraccionados o que induzcan a error.</li>
              <li><strong>Prueba de Autorización:</strong> Solicitar prueba de la autorización otorgada para el tratamiento de sus datos.</li>
              <li><strong>Información sobre el Uso:</strong> Ser informado, previa solicitud, respecto del uso que se le ha dado a sus datos personales.</li>
              <li><strong>Revocación y Supresión:</strong> Revocar la autorización y/o solicitar la supresión del dato de nuestras bases, a menos que exista una obligación legal o contractual que impida su supresión.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              4. Medidas de Seguridad
            </h2>
            <p>
              Vanguardistas se compromete a adoptar las medidas técnicas, humanas y administrativas necesarias para garantizar la seguridad de los registros, evitando su adulteración, pérdida, consulta, uso o acceso no autorizado.{" "}
              <span className="text-green-accent font-medium">La confidencialidad de la información es una obligación</span>{" "}
              de todos los que intervienen en el tratamiento de los datos.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              5. Vigencia de la Política
            </h2>
            <p>
              Esta política rige a partir de su publicación y se mantendrá vigente mientras Vanguardistas desarrolle su objeto social. Nos reservamos el derecho de modificarla en cualquier momento, lo cual será informado a los titulares por los canales de comunicación habituales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
