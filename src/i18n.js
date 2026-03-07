export const translations = {
    en: {
      nav_feed: 'Feed',
      nav_channels: 'Channels',
      nav_new_post: 'New Post',
      nav_account: 'My Account',
      nav_directory: 'Directory',
      nav_sign_out: 'Sign Out',
      nav_sign_in: 'Sign In',
      checking_permissions: 'Checking permissions…',
  
      footer_note:
        'No direct messages by design. Discussions are visible only to members inside the network.',
  
      home_title: 'Texas Trades Network',
      home_intro:
        'Surplox is a members-only network for subcontractors and laborers across Texas. Join local trade discussions, ask questions by ZIP and radius, and stay connected to nearby crews.',
      home_join_prompt: 'Create your account to join the network.',
      home_join_button: 'Join Surplox',
      home_signed_in_prompt: 'You’re signed in and ready to browse local discussions.',
      home_go_feed: 'Go to Feed',
      home_create_post: 'Create Post',
      home_how_it_works: 'How It Works',
      home_how_it_works_body:
        'Posts are organized by trade and location. When someone creates a post, they choose a ZIP code and radius. Nearby members inside that area can see and respond.',
      home_example_label: 'Example:',
      home_example_body:
        'A post created in 76031 with a radius of 100 miles will appear to members whose location falls inside that area.',
  
      auth_signup_title: 'Create Your Surplox Account',
      auth_signin_title: 'Sign In to Surplox',
      auth_signup_intro:
        'Join the Surplox network to connect with local subcontractors and laborers across Texas.',
      auth_signin_intro:
        'Access your Surplox account to browse local trade discussions and manage your profile.',
      auth_members_only: 'Members Only',
      auth_members_only_body:
        'Surplox is built for subcontractors and laborers. No direct messaging. No public homeowner directory.',
      auth_email: 'Email',
      auth_password: 'Password',
      auth_wait: 'Please wait…',
      auth_create_account: 'Create Account',
      auth_sign_in: 'Sign In',
      auth_switch_to_signin: 'Already have an account? Sign In',
      auth_switch_to_signup: 'New to Surplox? Create an Account',
      auth_check_email:
        'Check your email for a confirmation link, then sign in to continue.',
      auth_error: 'Unable to complete authentication right now.',
  
      feed_loading: 'Loading your feed…',
      feed_unavailable: 'Feed Unavailable',
      feed_try_again: 'Try Again',
      feed_title: 'Local Feed',
      feed_intro: 'Browse trade discussions happening within your area',
      feed_intro_channel: ' for this channel.',
      feed_create_post: 'Create Post',
      feed_browse_channels: 'Browse Channels',
      feed_empty_title: 'Nothing Nearby Yet',
      feed_empty_body:
        'There are no posts in your current area yet. Start the conversation and create the first post.',
      feed_start_post: 'Start a Post',
      feed_zip: 'ZIP',
      feed_radius: 'mi radius',
  
      channels_loading: 'Loading trade channels…',
      channels_unavailable: 'Channels Unavailable',
      channels_error: 'Unable to load trade channels right now.',
      channels_title: 'Trade Channels',
      channels_intro:
        'Browse local discussions by trade. Select a channel to view posts in your area.',
      channels_empty_title: 'No Channels Yet',
      channels_empty_body: 'Trade channels have not been created yet.',
      channels_view_posts: 'View nearby posts in this trade',
  
      new_post_title: 'Create a New Post',
      new_post_intro:
        'Start a discussion for nearby members by choosing a trade, writing your post, and setting the ZIP code and radius where it should appear.',
      new_post_notice_title: 'Post Visibility',
      new_post_notice_body:
        'Your post will only appear to members whose location falls within the ZIP and radius you choose.',
      new_post_trade: 'Trade Channel',
      new_post_general: 'General Discussion',
      new_post_radius: 'Radius (miles)',
      new_post_zip: 'ZIP Code',
      new_post_example: 'Example',
      new_post_example_body:
        'A post created in 76031 with a 100 mile radius will be shown to nearby members inside that area.',
      new_post_title_label: 'Post Title',
      new_post_body_label: 'Post Details',
      new_post_body_placeholder:
        'Describe the situation, your location, and what kind of help or feedback you need.',
      new_post_publish: 'Publish Post',
      new_post_publishing: 'Publishing…',
  
      post_title_required: 'Post title is required',
      post_body_required: 'Post details are required',
      post_zip_invalid: 'Enter a valid 5-digit ZIP code',
      post_radius_invalid: 'Radius must be between 1 and 300 miles',
      post_zip_missing: 'ZIP code not found in the database',
      post_create_error: 'Unable to create post',
  
      detail_loading: 'Loading discussion…',
      detail_not_found: 'Post Not Found',
      detail_not_found_body:
        'This discussion may have been removed or is no longer available.',
      detail_return_feed: 'Return to Feed',
      detail_posted_by: 'Posted by',
      detail_upvote: '▲ Upvote',
      detail_upvoted: '▲ Upvoted',
      detail_downvote: '▼ Downvote',
      detail_downvoted: '▼ Downvoted',
      detail_back_feed: 'Back to Feed',
      detail_discussion: 'Discussion',
      detail_discussion_intro:
        'Join the conversation and share your experience, feedback, or recommendations.',
      detail_no_replies: 'No Replies Yet',
      detail_no_replies_body: 'Be the first to respond to this discussion.',
      detail_add_reply: 'Add a Reply',
      detail_reply_placeholder: 'Share your advice, experience, or answer here.',
      detail_post_reply: 'Post Reply',
      detail_comment_empty: 'Comment cannot be empty',
      detail_vote_error: 'Unable to save your vote.',
      detail_comment_error: 'Unable to post your comment.',
      detail_load_error: 'Unable to load this post right now.',
      detail_general: 'General Discussion',
  
      admin_loading: 'Loading crew directory…',
      admin_title: 'Crew Match Dashboard',
      admin_intro:
        'Search, filter, and organize your Surplox network by job location, trade, and crew size.',
      admin_job_zip: 'Job ZIP',
      admin_search_radius: 'Search radius (miles)',
      admin_trade: 'Trade',
      admin_all_trades: 'All trades',
      admin_min_crew: 'Minimum crew size',
      admin_search_label: 'Search by name, city, ZIP, or bio',
      admin_search_placeholder: 'Example: welder, Cleburne, 76031',
      admin_export: 'Export Results',
      admin_results: 'Matching Results',
      admin_results_intro:
        'Results are sorted by distance when a job ZIP is entered. Otherwise they appear from newest to oldest.',
      admin_no_matches: 'No Matches Found',
      admin_no_matches_body: 'Try widening the radius or removing one of the filters.',
      admin_zip: 'ZIP',
      admin_away: 'mi away',
      admin_crew: 'Crew',
      admin_save_notes: 'Save Notes',
      admin_saving: 'Saving…',
      admin_phone: 'Phone',
      admin_email: 'Email',
      admin_rating: 'Admin rating',
      admin_notes: 'Admin notes',
      admin_notes_placeholder:
        'Private notes for reliability, pricing, follow-up, or job history.',
      admin_bio: 'Bio',
      admin_rating_error: 'Rating must be between 1 and 5',
      admin_save_error: 'Unable to save your notes right now.'
    },
  
    es: {
      nav_feed: 'Publicaciones',
      nav_channels: 'Canales',
      nav_new_post: 'Nueva publicación',
      nav_account: 'Mi cuenta',
      nav_directory: 'Directorio',
      nav_sign_out: 'Cerrar sesión',
      nav_sign_in: 'Iniciar sesión',
      checking_permissions: 'Verificando permisos…',
  
      footer_note:
        'No hay mensajes directos por diseño. Las conversaciones solo son visibles para miembros dentro de la red.',
  
      home_title: 'Red de Oficios de Texas',
      home_intro:
        'Surplox es una red exclusiva para subcontratistas y trabajadores en Texas. Únete a conversaciones locales por oficio, haz preguntas por código postal y radio, y mantente conectado con cuadrillas cercanas.',
      home_join_prompt: 'Crea tu cuenta para unirte a la red.',
      home_join_button: 'Únete a Surplox',
      home_signed_in_prompt:
        'Ya iniciaste sesión y estás listo para explorar conversaciones locales.',
      home_go_feed: 'Ir a publicaciones',
      home_create_post: 'Crear publicación',
      home_how_it_works: 'Cómo funciona',
      home_how_it_works_body:
        'Las publicaciones se organizan por oficio y ubicación. Cuando alguien crea una publicación, elige un código postal y un radio. Los miembros cercanos dentro de esa zona pueden verla y responder.',
      home_example_label: 'Ejemplo:',
      home_example_body:
        'Una publicación creada en 76031 con un radio de 100 millas aparecerá para los miembros cuya ubicación esté dentro de esa zona.',
  
      auth_signup_title: 'Crea tu cuenta de Surplox',
      auth_signin_title: 'Inicia sesión en Surplox',
      auth_signup_intro:
        'Únete a la red de Surplox para conectar con subcontratistas y trabajadores locales en todo Texas.',
      auth_signin_intro:
        'Accede a tu cuenta de Surplox para ver conversaciones locales y administrar tu perfil.',
      auth_members_only: 'Solo para miembros',
      auth_members_only_body:
        'Surplox está hecho para subcontratistas y trabajadores. No hay mensajes directos. No existe un directorio público para propietarios.',
      auth_email: 'Correo electrónico',
      auth_password: 'Contraseña',
      auth_wait: 'Espera…',
      auth_create_account: 'Crear cuenta',
      auth_sign_in: 'Iniciar sesión',
      auth_switch_to_signin: '¿Ya tienes cuenta? Inicia sesión',
      auth_switch_to_signup: '¿Nuevo en Surplox? Crea una cuenta',
      auth_check_email:
        'Revisa tu correo para confirmar tu cuenta y luego inicia sesión.',
      auth_error: 'No se pudo completar la autenticación en este momento.',
  
      feed_loading: 'Cargando tus publicaciones…',
      feed_unavailable: 'Publicaciones no disponibles',
      feed_try_again: 'Intentar de nuevo',
      feed_title: 'Publicaciones locales',
      feed_intro: 'Explora conversaciones de oficios que están ocurriendo dentro de tu zona',
      feed_intro_channel: ' para este canal.',
      feed_create_post: 'Crear publicación',
      feed_browse_channels: 'Ver canales',
      feed_empty_title: 'Todavía no hay nada cerca',
      feed_empty_body:
        'Aún no hay publicaciones en tu zona. Inicia la conversación y crea la primera publicación.',
      feed_start_post: 'Crear publicación',
      feed_zip: 'CP',
      feed_radius: 'mi de radio',
  
      channels_loading: 'Cargando canales de oficio…',
      channels_unavailable: 'Canales no disponibles',
      channels_error: 'No se pudieron cargar los canales en este momento.',
      channels_title: 'Canales de oficio',
      channels_intro:
        'Explora conversaciones locales por oficio. Selecciona un canal para ver publicaciones dentro de tu zona.',
      channels_empty_title: 'Todavía no hay canales',
      channels_empty_body: 'Aún no se han creado canales de oficio.',
      channels_view_posts: 'Ver publicaciones cercanas en este oficio',
  
      new_post_title: 'Crear una nueva publicación',
      new_post_intro:
        'Inicia una conversación para miembros cercanos eligiendo un oficio, escribiendo tu publicación y definiendo el código postal y el radio donde debe aparecer.',
      new_post_notice_title: 'Visibilidad de la publicación',
      new_post_notice_body:
        'Tu publicación solo aparecerá para miembros cuya ubicación esté dentro del código postal y radio que elijas.',
      new_post_trade: 'Canal de oficio',
      new_post_general: 'Discusión general',
      new_post_radius: 'Radio (millas)',
      new_post_zip: 'Código postal',
      new_post_example: 'Ejemplo',
      new_post_example_body:
        'Una publicación creada en 76031 con un radio de 100 millas se mostrará a miembros cercanos dentro de esa zona.',
      new_post_title_label: 'Título de la publicación',
      new_post_body_label: 'Detalles de la publicación',
      new_post_body_placeholder:
        'Describe la situación, tu ubicación y qué tipo de ayuda o comentarios necesitas.',
      new_post_publish: 'Publicar',
      new_post_publishing: 'Publicando…',
  
      post_title_required: 'El título es obligatorio',
      post_body_required: 'Los detalles de la publicación son obligatorios',
      post_zip_invalid: 'Ingresa un código postal válido de 5 dígitos',
      post_radius_invalid: 'El radio debe estar entre 1 y 300 millas',
      post_zip_missing: 'El código postal no se encontró en la base de datos',
      post_create_error: 'No se pudo crear la publicación',
  
      detail_loading: 'Cargando conversación…',
      detail_not_found: 'Publicación no encontrada',
      detail_not_found_body:
        'Esta conversación pudo haber sido eliminada o ya no está disponible.',
      detail_return_feed: 'Volver a publicaciones',
      detail_posted_by: 'Publicado por',
      detail_upvote: '▲ Votar arriba',
      detail_upvoted: '▲ Voto arriba',
      detail_downvote: '▼ Votar abajo',
      detail_downvoted: '▼ Voto abajo',
      detail_back_feed: 'Regresar a publicaciones',
      detail_discussion: 'Conversación',
      detail_discussion_intro:
        'Únete a la conversación y comparte tu experiencia, opinión o recomendación.',
      detail_no_replies: 'Todavía no hay respuestas',
      detail_no_replies_body: 'Sé el primero en responder a esta conversación.',
      detail_add_reply: 'Agregar respuesta',
      detail_reply_placeholder: 'Comparte aquí tu consejo, experiencia o respuesta.',
      detail_post_reply: 'Publicar respuesta',
      detail_comment_empty: 'El comentario no puede estar vacío',
      detail_vote_error: 'No se pudo guardar tu voto.',
      detail_comment_error: 'No se pudo publicar tu comentario.',
      detail_load_error: 'No se pudo cargar esta publicación.',
      detail_general: 'Discusión general',
  
      admin_loading: 'Cargando directorio de cuadrillas…',
      admin_title: 'Panel de coincidencia de cuadrillas',
      admin_intro:
        'Busca, filtra y organiza tu red de Surplox por ubicación del trabajo, oficio y tamaño de cuadrilla.',
      admin_job_zip: 'Código postal del trabajo',
      admin_search_radius: 'Radio de búsqueda (millas)',
      admin_trade: 'Oficio',
      admin_all_trades: 'Todos los oficios',
      admin_min_crew: 'Tamaño mínimo de cuadrilla',
      admin_search_label: 'Buscar por nombre, ciudad, CP o biografía',
      admin_search_placeholder: 'Ejemplo: soldador, Cleburne, 76031',
      admin_export: 'Exportar resultados',
      admin_results: 'Resultados coincidentes',
      admin_results_intro:
        'Los resultados se ordenan por distancia cuando se ingresa un código postal del trabajo. De lo contrario, aparecen del más reciente al más antiguo.',
      admin_no_matches: 'No se encontraron coincidencias',
      admin_no_matches_body: 'Prueba ampliando el radio o quitando alguno de los filtros.',
      admin_zip: 'CP',
      admin_away: 'mi de distancia',
      admin_crew: 'Cuadrilla',
      admin_save_notes: 'Guardar notas',
      admin_saving: 'Guardando…',
      admin_phone: 'Teléfono',
      admin_email: 'Correo',
      admin_rating: 'Calificación interna',
      admin_notes: 'Notas internas',
      admin_notes_placeholder:
        'Notas privadas sobre confiabilidad, precios, seguimiento o historial de trabajo.',
      admin_bio: 'Biografía',
      admin_rating_error: 'La calificación debe estar entre 1 y 5',
      admin_save_error: 'No se pudieron guardar tus notas.'
    }
  }
  
  export function t(lang, key) {
    const safeLang = translations[lang] ? lang : 'en'
    return translations[safeLang][key] || translations.en[key] || key
  }