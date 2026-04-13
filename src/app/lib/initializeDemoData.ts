import * as commentService from './commentService';

// Initialiser des commentaires de démonstration pour l'utilisateur
export async function initializeDemoComments(userId: string, userName: string, userAvatar?: string) {
  const existingComments = await commentService.getAllComments();
  
  // Ne pas initialiser si l'utilisateur a déjà des commentaires
  const userHasComments = existingComments.some(c => c.userId === userId);
  if (userHasComments) {
    return;
  }

  // Créer des commentaires de démonstration réalistes
  const demoComments = [
    {
      postId: 'post_paris_1',
      postTitle: 'Les meilleurs restaurants à Paris - Le Marais',
      content: 'Excellent conseil ! J\'ai essayé le restaurant que tu recommandes et c\'était délicieux. Le rapport qualité-prix est vraiment top. Merci pour le partage !',
      destination: 'Paris, France',
      category: 'restaurants',
    },
    {
      postId: 'post_tokyo_1',
      postTitle: 'Guide complet pour visiter Tokyo en 5 jours',
      content: 'Super itinéraire ! Par contre, attention aux horaires du métro le dimanche, ils peuvent être différents. Sinon tout est parfait 👍',
      destination: 'Tokyo, Japon',
      category: 'transport',
    },
    {
      postId: 'post_barcelona_1',
      postTitle: 'Arnaques courantes à éviter à Barcelone',
      content: 'Merci pour ces conseils de sécurité précieux ! J\'ai failli me faire avoir par l\'arnaque des faux policiers aux Ramblas. Heureusement j\'avais lu ton post avant.',
      destination: 'Barcelone, Espagne',
      category: 'safety',
    },
    {
      postId: 'post_london_1',
      postTitle: 'Meilleures activités gratuites à Londres',
      content: 'Le British Museum est effectivement incroyable ! J\'y ai passé toute une journée. N\'oubliez pas de réserver votre créneau en ligne à l\'avance.',
      destination: 'Londres, Royaume-Uni',
      category: 'activities',
    },
    {
      postId: 'post_dubai_1',
      postTitle: 'Hôtels avec vue sur Burj Khalifa - Recommandations',
      content: 'J\'ai séjourné dans l\'hôtel que tu mentionnes et la vue était à couper le souffle ! Le petit-déjeuner buffet vaut vraiment le coup aussi.',
      destination: 'Dubaï, EAU',
      category: 'accommodation',
    },
  ];

  // Créer les commentaires avec des dates variées (3 jours à 2 semaines)
  for (let i = 0; i < demoComments.length; i++) {
    const comment = demoComments[i];
    const daysAgo = i * 2 + 1; // 1, 3, 5, 7, 9 jours
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    
    try {
      const newComment = await commentService.createComment(userId, userName, userAvatar, comment);
      
      // Ajouter des likes aléatoires (entre 2 et 8 likes)
      const likesCount = Math.floor(Math.random() * 7) + 2;
      for (let j = 0; j < likesCount; j++) {
        newComment.likedBy.push(`user_${j}`);
        newComment.likes = likesCount;
      }
      
      // Mettre à jour la date
      newComment.createdAt = createdAt.toISOString();
      
      // Sauvegarder les modifications
      const allComments = await commentService.getAllComments();
      const index = allComments.findIndex(c => c.id === newComment.id);
      if (index !== -1) {
        allComments[index] = newComment;
        localStorage.setItem('lokadia_comments', JSON.stringify(allComments));
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des commentaires:', error);
    }
  }
}
